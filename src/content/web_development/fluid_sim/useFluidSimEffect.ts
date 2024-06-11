import { RefObject, useEffect, useState } from 'react'
import * as _webgpu from '@webgpu/types'

import shaders from './shaders'

interface Dimension {
  w: number
  h: number
}

interface Buffer {
  dim: Dimension
  buffer: GPUBuffer
}

enum RenderMode {
  Classic,
  Smoke2D,
  Smoke3D,
}

const FLOAT_BYTES = 4

const runFluidSim = (context: GPUCanvasContext, device: GPUDevice) => {
  // todo next up: these will be passed in as props from top-level, also passed to/managed by the control pane
  const props = {
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
  }
  const smokeProps = {
    raymarchSteps: 12,
    smokeDensity: 40,
    enableShadows: true,
    shadowIntensity: 25,
    smokeHeight: 0.2,
    lightHeight: 1,
    lightIntensity: 1,
    lightFalloff: 1,
  }

  let gridDim: Dimension
  let dyeDim: Dimension

  const { canvas } = context
  const createBuffer = (dim: Dimension, floatsPerElement = 1): Buffer => ({
    dim,
    buffer: device.createBuffer({
      size: dim.w * dim.h * floatsPerElement * FLOAT_BYTES,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
    }),
  })
  const createBuffers = () => ({
    velocity: createBuffer(gridDim, 2),
    velocity0: createBuffer(gridDim, 2),
    dye: createBuffer(dyeDim, 4),
    dye0: createBuffer(dyeDim, 4),
    divergence: createBuffer(gridDim),
    divergence0: createBuffer(gridDim),
    pressure: createBuffer(gridDim),
    pressure0: createBuffer(gridDim),
    vorticity: createBuffer(gridDim),
  })
  const copyBuffer = (command: GPUCommandEncoder, from: GPUBuffer, to: GPUBuffer) => {
    command.copyBufferToBuffer(from, 0, to, 0, from.size)
  }

  const createUniformBuffer = (values: number[]) => {
    const buffer = device.createBuffer({
      size: values.length * FLOAT_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(buffer.getMappedRange()).set(values)
    buffer.unmap()
    return buffer
  }
  const updateUniformBuffer = (buffer: GPUBuffer, values: number[]) => {
    device.queue.writeBuffer(buffer, 0, new Float32Array(values), 0, buffer.size / FLOAT_BYTES)
  }

  const initSizes = () => {
    const scaleDims = (size: number) => {
      // Fit to screen while keeping the aspect ratio.
      const aspectRatio = window.innerWidth / window.innerHeight
      const maxSize = device.limits.maxTextureDimension2D
      const dim = aspectRatio > 1 ? { w: size * aspectRatio, h: size } : { w: size, h: size / aspectRatio }
      // Downscale if necessary to prevent canvas size overflow.
      const ratio = dim.w > maxSize ? maxSize / dim.w : dim.h > maxSize ? maxSize / dim.h : 1
      return { w: Math.floor(dim.w * ratio), h: Math.floor(dim.h * ratio) }
    }

    gridDim = scaleDims(props.gridSize)
    dyeDim = scaleDims(props.dyeSize)

    canvas.width = dyeDim.w
    canvas.height = dyeDim.h
  }

  let buffers: Record<string, Buffer>
  const onSizeChange = () => {
    initSizes()
    buffers = createBuffers()
    programs = createPrograms()
    updateQueue.push(['gridSize', [gridDim.w, gridDim.h, dyeDim.w, dyeDim.h, props.gridSize * 4, props.dyeSize * 4]])
  }

  const createRenderProgram = () => {
    const shaderModule = device.createShaderModule({ code: shaders.render })
    const vertices = new Float32Array([-1, -1, 0, 1, -1, 1, 0, 1, 1, -1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, 1, 1, 0, 1])
    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices)
    vertexBuffer.unmap()

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

    const renderBuffer = createBuffer(dyeDim, 4)

    return {
      pipeline,
      vertexBuffer,
      buffer: renderBuffer,
      bindGroup: device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          renderBuffer.buffer,
          uniformBuffers.gridSize,
          uniformBuffers.mouse,
          uniformBuffers.renderMode,
          uniformBuffers.smokeParams,
        ].map((buffer, binding) => ({ binding, resource: { buffer } })),
      }),
      passDescriptor: {
        colorAttachments: [{ clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store', view: null }],
      },
    }
  }

  const createPrograms = () => {
    const program = (buffers: Buffer[], uniformBuffers: GPUBuffer[], shader: string) => {
      const pipeline = device.createComputePipeline({
        layout: 'auto',
        compute: { module: device.createShaderModule({ code: shader }), entryPoint: 'main' },
      })
      return {
        pipeline,
        bindGroup: device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [...buffers.map(({ buffer }) => buffer), ...uniformBuffers].map((buffer, binding) => ({
            binding,
            resource: { buffer },
          })),
        }),
        dim: buffers[0].dim,
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

  initSizes()

  const uniformBuffers: Record<string, GPUBuffer> = {
    time: createUniformBuffer([0]),
    dt: createUniformBuffer([0]),
    mouse: createUniformBuffer([0, 0, 0, 0]),
    gridSize: createUniformBuffer([gridDim.w, gridDim.h, dyeDim.w, dyeDim.h, props.gridSize * 4, props.dyeSize * 4]),
    smokeParams: createUniformBuffer([
      smokeProps.raymarchSteps,
      smokeProps.smokeDensity,
      smokeProps.enableShadows ? 1 : 0,
      smokeProps.shadowIntensity,
      smokeProps.smokeHeight,
      smokeProps.lightHeight,
      smokeProps.lightIntensity,
      smokeProps.lightFalloff,
    ]),
  }

  for (const key of [
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
  ]) {
    uniformBuffers[key] = createUniformBuffer([props[key]])
  }

  let updateQueue: [string, number[]][] = []

  let prevMousePos: [number, number] | null = null
  const onMouseStopMoving = () => {
    updateQueue.push(['mouse', [...prevMousePos, 0, 0]])
  }
  let mouseMoveTimeout: number
  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    clearTimeout(mouseMoveTimeout)
    const { width, height } = (canvas as HTMLCanvasElement).getBoundingClientRect()
    const mousePos = [e.offsetX / width, 1 - e.offsetY / height]
    const mouseVelocity = prevMousePos ? [mousePos[0] - prevMousePos[0], mousePos[1] - prevMousePos[1]] : [0, 0]
    prevMousePos = [mousePos[0], mousePos[1]]

    updateQueue.push(['mouse', [...mousePos, ...mouseVelocity]])
    mouseMoveTimeout = setTimeout(onMouseStopMoving, 100)
  })
  let resizeTimeout: number
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(onSizeChange, 150)
  })

  const onPropChange = (key, val) => {
    if (key in props) props[key] = val
    else if (key in smokeProps) smokeProps[key] = val

    // Check if the prop has an associated uniform buffer.
    if (key == 'simSpeed') return

    const isSmokeParam = key in smokeProps
    const isGridParam = key == 'gridSize' || key == 'dyeSize'
    const uniformKey = isSmokeParam ? 'smokeParams' : isGridParam ? 'gridSize' : key
    const uniformValues = isSmokeParam
      ? [
          smokeProps.raymarchSteps,
          smokeProps.smokeDensity,
          smokeProps.enableShadows ? 1 : 0,
          smokeProps.shadowIntensity,
          smokeProps.smokeHeight,
          smokeProps.lightHeight,
          smokeProps.lightIntensity,
          smokeProps.lightFalloff,
        ]
      : isGridParam
        ? [gridDim.w, gridDim.h, dyeDim.w, dyeDim.h, props.gridSize * 4, props.dyeSize * 4]
        : [val]
    updateQueue.push([uniformKey, uniformValues])
  }

  const reset = () => {
    const { velocity, dye, pressure } = buffers
    for (const { buffer } of [velocity, dye, pressure]) {
      device.queue.writeBuffer(buffer, 0, new Float32Array(buffer.size / FLOAT_BYTES))
    }
    time = 0
  }

  buffers = createBuffers()
  let programs = createPrograms()
  let lastFrame = performance.now()
  let dt = 0.0
  let time = 0.0

  // Render loop
  const step = () => {
    requestAnimationFrame(step)

    const now = performance.now()
    dt = Math.min(1 / 60, (now - lastFrame) / 1000) * props.simSpeed
    time += dt
    lastFrame = now

    updateUniformBuffer(uniformBuffers.dt, [dt])
    updateUniformBuffer(uniformBuffers.time, [time])
    while (updateQueue.length) {
      const [name, value] = updateQueue.shift()!
      updateUniformBuffer(uniformBuffers[name], value)
    }

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

  step()

  return { onPropChange, reset }
}

const useFluidSimEffect = (canvasRef: RefObject<HTMLCanvasElement>, device: GPUDevice | null) => {
  const [simulation, setSimulation] = useState<any>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !device) return

    try {
      const context = canvas.getContext('webgpu')
      if (!context) throw new Error('Canvas does not support WebGPU')

      setSimulation(runFluidSim(context, device))
    } catch (e) {
      console.error(e)
    }
  }, [canvasRef, device])

  return simulation
}

export { useFluidSimEffect, RenderMode }
