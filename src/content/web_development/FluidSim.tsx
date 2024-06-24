import React, { useEffect, useRef, useState } from 'react'
import * as _webgpu from '@webgpu/types'

import { ListIcon, TimesIcon } from 'icons'
import shaders from './FluidSimShaders'

interface GridSize {
  w: number
  h: number
}

interface GridBuffer {
  size: GridSize
  buffer: GPUBuffer
}

interface UniformBuffer {
  buffer: GPUBuffer
  values: Float32Array // Staging buffer
}

enum RenderMode {
  Classic,
  Smoke2D,
  Smoke3D,
}

interface SmokeProps {
  raymarchSteps: number
  smokeDensity: number
  enableShadows: boolean
  shadowIntensity: number
  smokeHeight: number
  lightHeight: number
  lightIntensity: number
  lightFalloff: number
}

interface FluidSimProps {
  gridSize: number
  dyeSize: number
  renderMode: RenderMode
  containFluid: boolean
  simSpeed: number
  velocityForce: number
  velocityRadius: number
  velocityDiffusion: number
  dyeIntensity: number
  dyeRadius: number
  dyeDiffusion: number
  viscosity: number
  vorticity: number
  smoke: SmokeProps
}

const FLOAT_BYTES = 4

const copyBuffer = (command: GPUCommandEncoder, from: GPUBuffer, to: GPUBuffer) => {
  command.copyBufferToBuffer(from, 0, to, 0, from.size)
}

const runFluidSim = (props: FluidSimProps, context: GPUCanvasContext, device: GPUDevice) => {
  const createGpuBuffer = (values: number[], usage: GPUBufferUsageFlags): GPUBuffer => {
    const buffer = device.createBuffer({
      size: values.length * FLOAT_BYTES,
      usage: usage | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(buffer.getMappedRange()).set(values)
    buffer.unmap()
    return buffer
  }

  const createUniformBuffer = (values: number[]): UniformBuffer => ({
    buffer: createGpuBuffer(values, GPUBufferUsage.UNIFORM),
    values: new Float32Array(values),
  })
  const updateUniformBuffer = (buffer: UniformBuffer) => {
    device.queue.writeBuffer(buffer.buffer, 0, buffer.values, 0, buffer.values.length)
  }

  let gridSize: GridSize
  let dyeGridSize: GridSize
  const gridSizeUniformValues = () => [
    gridSize.w,
    gridSize.h,
    dyeGridSize.w,
    dyeGridSize.h,
    props.gridSize * 4,
    props.dyeSize * 4,
  ]

  let updateQueue: string[] = []

  const onPropChange = (key, val) => {
    if (key in props) props[key] = val
    else if (key in props.smoke) props.smoke[key] = val

    // Check if the prop has an associated uniform buffer.
    if (key == 'simSpeed') return

    const isSmokeParam = key in props.smoke
    const isGridParam = key == 'gridSize' || key == 'dyeSize'
    if (isSmokeParam) uniformBuffers.smokeParams.values[Object.keys(props.smoke).indexOf(key)] = val
    else if (isGridParam) uniformBuffers.gridSize.values.set(gridSizeUniformValues())
    else uniformBuffers[key].values[0] = val
    updateQueue.push(isSmokeParam ? 'smokeParams' : isGridParam ? 'gridSize' : key)
  }

  const gridBuffer = (size: GridSize, channels = 1): GridBuffer => ({
    size,
    buffer: device.createBuffer({
      size: size.w * size.h * channels * FLOAT_BYTES,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    }),
  })
  const createBuffers = () => ({
    velocity: gridBuffer(gridSize, 2),
    velocity0: gridBuffer(gridSize, 2),
    dye: gridBuffer(dyeGridSize, 4),
    dye0: gridBuffer(dyeGridSize, 4),
    divergence: gridBuffer(gridSize),
    divergence0: gridBuffer(gridSize),
    pressure: gridBuffer(gridSize),
    pressure0: gridBuffer(gridSize),
    vorticity: gridBuffer(gridSize),
  })

  const initGridSizes = () => {
    const scale = (s: number) => {
      // Fit to screen while keeping the aspect ratio.
      const aspectRatio = window.innerWidth / window.innerHeight
      const size = aspectRatio > 1 ? { w: s * aspectRatio, h: s } : { w: s, h: s / aspectRatio }
      // Downscale if necessary to prevent canvas size overflow.
      const maxDim = device.limits.maxTextureDimension2D
      const ratio = Math.min(maxDim / size.w, maxDim / size.h, 1)
      return { w: Math.floor(size.w * ratio), h: Math.floor(size.h * ratio) }
    }

    gridSize = scale(props.gridSize)
    dyeGridSize = scale(props.dyeSize)

    context.canvas.width = dyeGridSize.w
    context.canvas.height = dyeGridSize.h
  }

  let buffers: Record<string, GridBuffer>

  const onSizeChange = () => {
    initGridSizes()
    buffers = createBuffers()
    programs = createPrograms()
    uniformBuffers.gridSize.values.set(gridSizeUniformValues())
    updateQueue.push('gridSize')
  }

  const createRenderProgram = () => {
    const shaderModule = device.createShaderModule({ code: shaders.render })
    const vertexBuffer = createGpuBuffer(
      [-1, -1, 0, 1, -1, 1, 0, 1, 1, -1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, 1, 1, 0, 1],
      GPUBufferUsage.VERTEX,
    )

    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vertex_main',
        buffers: [
          {
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x4' }],
            arrayStride: 4 * FLOAT_BYTES,
            stepMode: 'vertex',
          },
        ],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragment_main',
        targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
      },
      primitive: { topology: 'triangle-list' },
    })

    const renderBuffer = gridBuffer(dyeGridSize, 4)

    return {
      pipeline,
      vertexBuffer,
      buffer: renderBuffer,
      bindGroup: device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          renderBuffer.buffer,
          uniformBuffers.gridSize.buffer,
          uniformBuffers.mouse.buffer,
          uniformBuffers.renderMode.buffer,
          uniformBuffers.smokeParams.buffer,
        ].map((buffer, binding) => ({ binding, resource: { buffer } })),
      }),
      passDescriptor: {
        colorAttachments: [{ clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store', view: null }],
      },
    }
  }

  const createPrograms = () => {
    const program = (buffers: GridBuffer[], uniformBuffers: UniformBuffer[], shader: string) => {
      const pipeline = device.createComputePipeline({
        layout: 'auto',
        compute: { module: device.createShaderModule({ code: shader }), entryPoint: 'main' },
      })
      return {
        pipeline,
        bindGroup: device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [
            ...buffers.map(({ buffer }) => buffer),
            ...uniformBuffers.map(({ buffer: gpuBuffer }) => gpuBuffer),
          ].map((buffer, binding) => ({
            binding,
            resource: { buffer },
          })),
        }),
        dim: buffers[0].size,
      }
    }

    const { velocity, velocity0, dye, dye0, divergence, divergence0, pressure, pressure0, vorticity } = buffers
    const {
      gridSize,
      mouse,
      time,
      dt,
      velocityForce,
      velocityRadius,
      velocityDiffusion,
      dyeIntensity,
      dyeRadius,
      dyeDiffusion,
      containFluid,
      viscosity: viscosity_value,
      vorticity: vorticity_value,
    } = uniformBuffers
    // Pressure programs are used multiple times.
    const pressureProgram = program([pressure, divergence, pressure0], [gridSize], shaders.pressure),
      boundaryPressureProgram = program([pressure0, pressure], [gridSize], shaders.boundaryPressure)

    const { renderMode } = props
    const pressureIterations = 16
    return {
      compute: [
        ...(renderMode >= 1 && renderMode <= 3 ? [program([dye], [gridSize, time], shaders.checkerboard)] : []),
        // Add dye and velocity at the mouse position.
        program([dye, dye0], [gridSize, mouse, dyeIntensity, dyeRadius, dyeDiffusion, time, dt], shaders.updateDye),
        program(
          [velocity, velocity0],
          [gridSize, mouse, velocityForce, velocityRadius, velocityDiffusion, dt],
          shaders.updateVelocity,
        ),
        // Advect the velocity field through itself.
        program([velocity0, velocity0, velocity], [gridSize, dt], shaders.advect),
        program([velocity, velocity0], [gridSize, containFluid], shaders.boundary),
        // Compute the divergence.
        program([velocity0, divergence0], [gridSize], shaders.divergence),
        program([divergence0, divergence], [gridSize], shaders.boundaryPressure),
        // Solve the Jacobi pressure equation.
        ...Array.from({ length: pressureIterations }, () => [pressureProgram, boundaryPressureProgram]).flat(),
        // Subtract the pressure from the velocity field.
        program([pressure, velocity0, velocity], [gridSize], shaders.gradientSubtract),
        program([pressure, pressure0], [gridSize, viscosity_value], shaders.clearPressure),
        // Compute and apply vorticity confinment.
        program([velocity, vorticity], [gridSize], shaders.vorticity),
        program([velocity, vorticity, velocity0], [gridSize, dt, vorticity_value], shaders.vorticityConfinment),
        // Advect the dye through the velocity field.
        program([dye0, velocity0, dye], [gridSize, dt], shaders.advectDye),
      ],
      render: createRenderProgram(),
    }
  }

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    alphaMode: 'opaque',
  })

  initGridSizes()

  const uniformBuffers: Record<string, UniformBuffer> = {
    time: createUniformBuffer([0]),
    dt: createUniformBuffer([0]),
    mouse: createUniformBuffer([0, 0, 0, 0]),
    gridSize: createUniformBuffer(gridSizeUniformValues()),
    smokeParams: createUniformBuffer(Object.values(props.smoke)),
  }

  const singleValuePropKeys = [
    'renderMode',
    'containFluid',
    'velocityForce',
    'velocityRadius',
    'velocityDiffusion',
    'dyeIntensity',
    'dyeRadius',
    'dyeDiffusion',
    'viscosity',
    'vorticity',
  ]
  for (const key of singleValuePropKeys) uniformBuffers[key] = createUniformBuffer([props[key]])

  buffers = createBuffers()
  let programs = createPrograms()
  let lastTime = performance.now()

  const onMouseStopMoving = () => {
    const { mouse } = uniformBuffers
    mouse.values[2] = mouse.values[3] = 0
    updateQueue.push('mouse')
  }
  const onMouseMove = (pos: [number, number]) => {
    const {
      mouse: { values },
    } = uniformBuffers
    // Calculate velocity.
    values[2] = pos[0] - values[0]
    values[3] = pos[1] - values[1]
    // Try and catch large jumps that are likely due to mouse re-entering the canvas.
    if (values[2] > 0.1 || values[3] > 0.1) values[2] = values[3] = 0
    // Update position.
    values[0] = pos[0]
    values[1] = pos[1]
    updateQueue.push('mouse')
  }

  const reset = () => {
    const { velocity, dye, pressure } = buffers
    for (const { buffer } of [velocity, dye, pressure]) {
      device.queue.writeBuffer(buffer, 0, new Float32Array(buffer.size / FLOAT_BYTES))
    }
    uniformBuffers.time.values[0] = 0
  }

  // Render loop
  const step = () => {
    const now = performance.now()
    uniformBuffers.dt.values[0] = ((now - lastTime) / 1000) * props.simSpeed
    uniformBuffers.time.values[0] += uniformBuffers.dt.values[0]
    lastTime = now

    updateUniformBuffer(uniformBuffers.dt)
    updateUniformBuffer(uniformBuffers.time)
    while (updateQueue.length) updateUniformBuffer(uniformBuffers[updateQueue.shift()!])

    const command = device.createCommandEncoder()
    const computePass = command.beginComputePass()
    programs.compute.forEach(({ pipeline, bindGroup, dim: { w, h } }) => {
      computePass.setPipeline(pipeline)
      computePass.setBindGroup(0, bindGroup)
      computePass.dispatchWorkgroups(Math.ceil(w / 8), Math.ceil(h / 8))
    })
    computePass.end()

    const { render } = programs
    copyBuffer(command, buffers.velocity0.buffer, buffers.velocity.buffer)
    copyBuffer(command, buffers.pressure0.buffer, buffers.pressure.buffer)
    copyBuffer(command, buffers.dye.buffer, render.buffer.buffer)

    render.passDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()
    const renderPass = command.beginRenderPass(render.passDescriptor)
    renderPass.setPipeline(render.pipeline)
    renderPass.setBindGroup(0, render.bindGroup)
    renderPass.setVertexBuffer(0, render.vertexBuffer)
    renderPass.draw(6)
    renderPass.end()
    device.queue.submit([command.finish()])
  }

  return { step, reset, onPropChange, onSizeChange, onMouseMove, onMouseStopMoving }
}

const Control: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <label style={{ marginRight: '0.5em', width: '6em', textAlign: 'right' }}>{label}</label>
    {React.cloneElement(children, { style: { ...children.props.style, flex: 1 } })}
  </div>
)

interface SliderProps {
  k: string
  l: string
  v: number
  cb: (key: string, value: number) => void
  min: number
  max: number
}
const Slider: React.FC<SliderProps> = ({ k, l, min, max, v, cb }) => (
  <Control label={l}>
    <input
      type="range"
      min={min}
      max={max}
      step={0.0001}
      value={v}
      onChange={(e) => cb(k, parseFloat(e.target.value))}
    />
  </Control>
)

interface ToggleProps {
  k: string
  l: string
  v: boolean
  cb: (key: string, value: boolean) => void
}
const Toggle: React.FC<ToggleProps> = ({ k, l, v, cb }) => (
  <Control label={l}>
    <input type="checkbox" checked={v} onChange={(e) => cb(k, e.target.checked)} />
  </Control>
)

interface DropdownProps {
  k: string
  l: string
  v: number
  cb: (key: string, value: any) => void
  options: { [key: string]: number } | number[]
}
const Dropdown: React.FC<DropdownProps> = ({ k, l, options, v, cb }) => (
  <Control label={l}>
    <select value={v} onChange={(e) => cb(k, parseInt(e.target.value))}>
      {Array.isArray(options)
        ? options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))
        : Object.entries(options).map(([name, value]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
    </select>
  </Control>
)

interface TabButtonProps {
  tabKey: string
  activeKey: string
  setActive: React.Dispatch<React.SetStateAction<string>>
  children: React.ReactNode
}
const TabButton: React.FC<TabButtonProps> = ({ tabKey, activeKey, setActive, children }) => (
  <div
    style={{
      borderBottom: `2px solid ${activeKey == tabKey ? '#1e90ff' : '#ccc'}`,
      padding: '0.25em 1em',
      cursor: 'pointer',
    }}
    onClick={() => setActive(tabKey)}
  >
    {children}
  </div>
)

interface ControlPaneProps {
  props: FluidSimProps
  onChange: (key: string, value: any) => void
  reset: () => void
  style?: React.CSSProperties
}
const ControlPane: React.FC<ControlPaneProps> = ({ props, onChange, reset, style = {} }) => {
  const [open, setOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'velocity' | 'dye' | 'lights' | 'shadows'>('velocity')

  const {
    renderMode,
    containFluid,
    simSpeed,
    gridSize,
    dyeSize,
    velocityForce,
    velocityRadius,
    velocityDiffusion,
    dyeIntensity,
    dyeRadius,
    dyeDiffusion,
    viscosity,
    vorticity,
    smoke,
  } = props
  const { lightHeight, lightIntensity, lightFalloff, enableShadows, shadowIntensity } = smoke

  return (
    <div className="control-pane" style={style}>
      {!open && <ListIcon className="clickable" onClick={() => setOpen(true)} />}
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5em' }}>
            <div style={{ flex: 'auto', fontWeight: 'bold' }}>Fluid Simulation Controls</div>
            <TimesIcon className="clickable" onClick={() => setOpen(false)} />
          </div>
          <Dropdown
            k="renderMode"
            l="Render mode"
            v={renderMode}
            options={{
              Classic: RenderMode.Classic,
              'Smoke 2D': RenderMode.Smoke2D,
              'Smoke 3D + Shadows': RenderMode.Smoke3D,
            }}
            cb={(k, v) => {
              if (v !== RenderMode.Smoke3D && ['lights', 'shadows'].includes(activeTab)) setActiveTab('velocity')
              onChange(k, v)
            }}
          />
          <Dropdown k="gridSize" l="Sim res" v={gridSize} options={[32, 64, 128, 256, 512, 1024]} cb={onChange} />
          <Dropdown k="dyeSize" l="Render res" v={dyeSize} options={[128, 256, 512, 1024, 2048]} cb={onChange} />
          <Toggle k="containFluid" l="Boundaries" v={containFluid} cb={onChange} />
          <Slider k="simSpeed" l="Sim speed" v={simSpeed} min={0.1} max={20} cb={onChange} />
          <Slider k="viscosity" l="Viscosity" v={viscosity} min={0} max={1} cb={onChange} />
          <Slider k="vorticity" l="Vorticity" v={vorticity} min={0} max={10} cb={onChange} />
          <div style={{ display: 'flex', marginBottom: '0.5em' }}>
            <TabButton tabKey={'velocity'} activeKey={activeTab} setActive={setActiveTab}>
              Velocity
            </TabButton>
            <TabButton tabKey={'dye'} activeKey={activeTab} setActive={setActiveTab}>
              Dye
            </TabButton>
            {renderMode === RenderMode.Smoke3D && (
              <>
                <TabButton tabKey={'lights'} activeKey={activeTab} setActive={setActiveTab}>
                  Lights
                </TabButton>
                <TabButton tabKey={'shadows'} activeKey={activeTab} setActive={setActiveTab}>
                  Shadows
                </TabButton>
              </>
            )}
          </div>
          {activeTab === 'velocity' && (
            <>
              <Slider k="velocityForce" l="Force" v={velocityForce} min={0} max={0.5} cb={onChange} />
              <Slider k="velocityRadius" l="Radius" v={velocityRadius} min={0} max={0.001} cb={onChange} />
              <Slider k="velocityDiffusion" l="Diffusion" v={velocityDiffusion} min={0.95} max={1} cb={onChange} />
            </>
          )}
          {activeTab === 'dye' && (
            <>
              <Slider k="dyeIntensity" l="Intensity" v={dyeIntensity} min={0} max={10} cb={onChange} />
              <Slider k="dyeRadius" l="Radius" v={dyeRadius} min={0} max={0.01} cb={onChange} />
              <Slider k="dyeDiffusion" l="Diffusion" v={dyeDiffusion} min={0.95} max={1} cb={onChange} />
            </>
          )}
          {renderMode === RenderMode.Smoke3D && activeTab === 'lights' && (
            <>
              <Slider k="lightHeight" l="Elevation" v={lightHeight} min={0.5} max={1} cb={onChange} />
              <Slider k="lightIntensity" l="Intensity" v={lightIntensity} min={0} max={1} cb={onChange} />
              <Slider k="lightFalloff" l="Falloff" v={lightFalloff} min={0.5} max={10} cb={onChange} />
            </>
          )}
          {renderMode === RenderMode.Smoke3D && activeTab === 'shadows' && (
            <>
              {/* <Slider k="raymarchSteps" l="3D res" v={raymarchSteps} min={5} max={20} cb={onChange} /> */}
              {/* todo hard-code raymarch steps in shader */}
              <Toggle k="enableShadows" l="Enable" v={enableShadows} cb={onChange} />
              <Slider k="shadowIntensity" l="Intensity" v={shadowIntensity} min={0} max={50} cb={onChange} />
            </>
          )}
          <input
            type="button"
            value="Reset sim"
            style={{ alignSelf: 'center', marginTop: 5, padding: '3px 8px' }}
            onClick={reset}
          />
        </div>
      )}
    </div>
  )
}

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [device, setDevice] = useState<GPUDevice | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [simulation, setSimulation] = useState<any>(null)
  const [props, setProps] = useState<FluidSimProps>({
    gridSize: 128,
    dyeSize: 1024,
    renderMode: RenderMode.Classic,
    containFluid: true,
    simSpeed: 5,
    velocityForce: 0.2,
    velocityRadius: 0.0002,
    velocityDiffusion: 0.9999,
    dyeIntensity: 1,
    dyeRadius: 0.001,
    dyeDiffusion: 0.98,
    viscosity: 0.8,
    vorticity: 2,
    smoke: {
      raymarchSteps: 12,
      smokeDensity: 40,
      enableShadows: true,
      shadowIntensity: 25,
      smokeHeight: 0.2,
      lightHeight: 1,
      lightIntensity: 1,
      lightFalloff: 1,
    },
  })
  const requestId = useRef<number>()

  useEffect(() => {
    const initDevice = async () => {
      if (!canvasRef.current) return

      try {
        if (!navigator.gpu) throw new Error('WebGPU NOT Supported')

        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter) throw new Error('No adapter found')

        setDevice(await adapter.requestDevice())
      } catch (e) {
        setErrorMessage(e.message)
      }
    }

    initDevice()

    return () => {
      device?.destroy()
      setDevice(null)
    }
  }, [canvasRef])

  useEffect(() => {
    if (!canvasRef.current || !device) return

    try {
      const canvas = canvasRef.current
      const context = canvas.getContext('webgpu')
      if (!context) throw new Error('Canvas does not support WebGPU')

      setSimulation(runFluidSim(props, context, device))
    } catch (e) {
      setErrorMessage(e.message)
    }
  }, [device])

  useEffect(() => {
    if (!simulation) return

    let resizeTimeout: number
    const onResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(simulation.onSizeChange, 150)
    }
    window.addEventListener('resize', onResize)

    let mouseMoveTimeout: number
    const onMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseMoveTimeout)
      const { width, height } = canvasRef.current.getBoundingClientRect()
      simulation.onMouseMove([e.offsetX / width, 1 - e.offsetY / height])
      mouseMoveTimeout = setTimeout(simulation.onMouseStopMoving, 100)
    }
    canvasRef.current.addEventListener('mousemove', onMouseMove)

    const animate = () => {
      simulation.step()
      requestId.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(requestId.current)

      canvasRef.current?.removeEventListener('mousemove', onMouseMove)
      clearTimeout(mouseMoveTimeout)

      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimeout)
    }
  }, [simulation])

  const onPropChange = (key: string, value: any) => {
    setProps((prevProps) => {
      if (key in props.smoke) return { ...prevProps, smoke: { ...prevProps.smoke, [key]: value } }
      return { ...prevProps, [key]: value }
    })
    simulation?.onPropChange(key, value)
  }

  return (
    <div>
      {!errorMessage && (
        <>
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          ></canvas>
          {simulation && (
            <ControlPane
              props={props}
              onChange={onPropChange}
              reset={simulation.reset}
              style={{
                position: 'absolute',
                top: '0.5em',
                right: '0.5em',
                padding: '0.5em',
                background: '#ffffff9b',
                borderRadius: 5,
              }}
            />
          )}
        </>
      )}
      {errorMessage && (
        <div style={{ padding: 10 }}>
          <p>
            WebGPU is not supported on this browser. <i>Error: {errorMessage}</i>
          </p>
        </div>
      )}
    </div>
  )
}
