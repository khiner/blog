import * as dat from 'dat.gui'
import * as _webgpu from '@webgpu/types'

import shaders from './shaders'

interface Dimension {
  w: number
  h: number
}

const FLOAT_BYTES = 4

// Manages a buffer for each dimension.
class DynamicBuffer {
  nDims: number
  dim: Dimension
  buffers: GPUBuffer[]

  constructor(device: GPUDevice, nDims: number, dim: Dimension) {
    this.nDims = nDims
    this.dim = dim
    this.buffers = Array.from({ length: nDims }, () =>
      device.createBuffer({
        size: dim.w * dim.h * FLOAT_BYTES,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      }),
    )
  }

  copyTo(buffer: DynamicBuffer, command: GPUCommandEncoder) {
    for (let i = 0; i < Math.max(this.nDims, buffer.nDims); i++) {
      command.copyBufferToBuffer(
        this.buffers[Math.min(i, this.buffers.length - 1)],
        0,
        buffer.buffers[Math.min(i, buffer.buffers.length - 1)],
        0,
        this.dim.w * this.dim.h * FLOAT_BYTES,
      )
    }
  }

  clear(queue: GPUQueue) {
    this.buffers.forEach((buffer) => queue.writeBuffer(buffer, 0, new Float32Array(this.dim.w * this.dim.h)))
  }
}

interface UniformProps {
  size?: number
  value?: number[]
  min?: number
  max?: number
  step?: number
  onChange?: (v: number) => void
  label?: string
  gui?: any
}

enum RenderMode {
  Classic,
  Smoke2D,
  Smoke3D,
  Velocity,
  Divergence,
  Pressure,
  Vorticity,
}

const settings = {
  render_mode: 0,
  grid_size: 128,
  grid_dim: { w: 1024, h: 1024 },
  reset: () => {},

  dye_size: 1024,
  sim_speed: 5,
  contain_fluid: true,
  velocity_force: 0.2,
  velocity_radius: 0.0002,
  velocity_diffusion: 0.9999,
  dye_intensity: 1,
  dye_radius: 0.001,
  dye_diffusion: 0.98,
  dye_dim: { w: 1024, h: 1024 },
  viscosity: 0.8,
  vorticity: 2,
  pressure_iterations: 20,
  buffer_view: 'dye',

  raymarch_steps: 12,
  smoke_density: 40,
  enable_shadows: true,
  shadow_intensity: 25,
  smoke_height: 0.2,
  light_height: 1,
  light_intensity: 1,
  light_falloff: 1,
}

const main = async (canvas: HTMLCanvasElement) => {
  if (navigator.gpu == null) throw new Error('WebGPU NOT Supported')

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw new Error('No adapter found')

  const device = await adapter.requestDevice()
  const context = canvas.getContext('webgpu')
  if (!context) throw new Error('Canvas does not support WebGPU')

  const initSizes = (canvas: HTMLCanvasElement) => {
    const scaleDims = (size: number) => {
      // Fit to screen while keeping the aspect ratio.
      const aspectRatio = window.innerWidth / window.innerHeight
      const maxCanvasSize = device.limits.maxTextureDimension2D
      const dim = aspectRatio > 1 ? { w: size * aspectRatio, h: size } : { w: size, h: size / aspectRatio }
      // Downscale if necessary to prevent canvas size overflow.
      const ratio = dim.w > maxCanvasSize ? maxCanvasSize / dim.w : dim.h > maxCanvasSize ? maxCanvasSize / dim.h : 1
      return { w: Math.floor(dim.w * ratio), h: Math.floor(dim.h * ratio) }
    }

    settings.grid_dim = scaleDims(settings.grid_size)
    settings.dye_dim = scaleDims(settings.dye_size)
    settings.rdx = settings.grid_size * 4
    settings.dyeRdx = settings.dye_size * 4
    settings.dx = 1 / settings.rdx

    canvas.width = settings.dye_dim.w
    canvas.height = settings.dye_dim.h
  }

  let buffers: Record<string, DynamicBuffer>

  // Buffers
  const initBuffers = () => {
    const { grid_dim, dye_dim } = settings
    return {
      velocity: new DynamicBuffer(device, 2, grid_dim),
      velocity0: new DynamicBuffer(device, 2, grid_dim),
      dye: new DynamicBuffer(device, 3, dye_dim),
      dye0: new DynamicBuffer(device, 3, dye_dim),
      divergence: new DynamicBuffer(device, 1, grid_dim),
      divergence0: new DynamicBuffer(device, 1, grid_dim),
      pressure: new DynamicBuffer(device, 1, grid_dim),
      pressure0: new DynamicBuffer(device, 1, grid_dim),
      vorticity: new DynamicBuffer(device, 1, grid_dim),
    }
  }

  const uniformBuffers: Record<string, GPUBuffer> = {}

  const onSizeChange = () => {
    initSizes(canvas)
    buffers = initBuffers()
    programs = createPrograms()
    uniformUpdateValues.grid_size = [
      settings.grid_dim.w,
      settings.grid_dim.h,
      settings.dye_dim.w,
      settings.dye_dim.h,
      settings.dx,
      settings.rdx,
      settings.dyeRdx,
    ]
  }
  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(onSizeChange, 150)
  })

  initSizes(canvas)
  const gui = new dat.GUI()
  gui.add(settings, 'pressure_iterations', 0, 50).name('Pressure Iterations')
  gui.add(settings, 'reset').name('Clear canvas')
  gui.add(settings, 'grid_size', [32, 64, 128, 256, 512, 1024]).name('Sim. Resolution').onChange(onSizeChange)
  gui.add(settings, 'dye_size', [128, 256, 512, 1024, 2048]).name('Render Resolution').onChange(onSizeChange)
  const smokeFolder = gui.addFolder('Smoke Parameters')
  smokeFolder.add(settings, 'raymarch_steps', 5, 20, 1).name('3D resolution')
  smokeFolder.add(settings, 'light_height', 0.5, 1, 0.001).name('Light Elevation')
  smokeFolder.add(settings, 'light_intensity', 0, 1, 0.001).name('Light Intensity')
  smokeFolder.add(settings, 'light_falloff', 0.5, 10, 0.001).name('Light Falloff')
  smokeFolder.add(settings, 'enable_shadows').name('Enable Shadows')
  smokeFolder.add(settings, 'shadow_intensity', 0, 50, 0.001).name('Shadow Intensity')
  smokeFolder.hide()

  const uniformUpdateValues: Record<string, number[]> = {}

  const uniformProps: Record<string, UniformProps> = {
    render_intensity_multiplier: { value: [1] },
    render_mode: {
      gui,
      label: 'Render Mode',
      min: {
        Classic: RenderMode.Classic,
        'Smoke 2D': RenderMode.Smoke2D,
        'Smoke 3D + Shadows': RenderMode.Smoke3D,
        'Debug - Velocity': RenderMode.Velocity,
        'Debug - Divergence': RenderMode.Divergence,
        'Debug - Pressure': RenderMode.Pressure,
        'Debug - Vorticity': RenderMode.Vorticity,
      },
      value: [0],
      onChange: (val) => {
        uniformUpdateValues.render_intensity_multiplier = [[1, 1, 1, 100, 10, 1e6, 1][parseInt(val)]]
        if (val == RenderMode.Smoke3D) smokeFolder.show(), smokeFolder.open()
        else smokeFolder.hide()
      },
    },
    time: {},
    dt: {},
    sim_speed: { label: 'Sim Speed', min: 0.1, max: 20 },
    velocity_force: { label: 'Velocity Force', min: 0, max: 0.5 },
    velocity_radius: { label: 'Velocity Radius', min: 0, max: 0.001 },
    velocity_diffusion: { label: 'Velocity Diffusion', min: 0.95, max: 1 },
    dye_intensity: { label: 'Dye Intensity', min: 0, max: 10 },
    dye_radius: { label: 'Dye Radius', min: 0, max: 0.01 },
    dye_diffusion: { label: 'Dye Diffusion', min: 0.95, max: 1 },
    viscosity: { label: 'Viscosity', min: 0, max: 1 },
    vorticity: { label: 'Vorticity', min: 0, max: 10 },
    contain_fluid: { label: 'Solid boundaries' },
    mouse: { size: 4 },
    grid_size: {
      value: [
        settings.grid_dim.w,
        settings.grid_dim.h,
        settings.dye_dim.w,
        settings.dye_dim.h,
        settings.dx,
        settings.rdx,
        settings.dyeRdx,
      ],
    },
    smoke_parameters: {
      value: [
        settings.raymarch_steps,
        settings.smoke_density,
        settings.enable_shadows ? 1 : 0,
        settings.shadow_intensity,
        settings.smoke_height,
        settings.light_height,
        settings.light_intensity,
        settings.light_falloff,
      ],
    },
  }
  Object.entries(uniformProps).forEach(([name, { size, value, min, max, step, onChange, label }]) => {
    const uniformSize = size ?? value?.length ?? 1
    if (uniformSize === 1) {
      if (settings[name] == null) {
        settings[name] = value ?? 0
      } else if (label) {
        gui
          .add(settings, name, min, max, step)
          .onChange((v) => {
            onChange?.(v)
            uniformUpdateValues[name] = [v]
          })
          .name(label)
      }
    }

    const mappedAtCreation = uniformSize === 1 || value != null
    const buffer = device.createBuffer({
      size: uniformSize * FLOAT_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      mappedAtCreation,
    })
    if (mappedAtCreation) {
      new Float32Array(buffer.getMappedRange()).set(new Float32Array(value ?? [settings[name]]))
      buffer.unmap()
    }

    uniformBuffers[name] = buffer
  })

  // Renders 3 (r, g, b) storage buffers to the canvas
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
    const dyeBuffer = new DynamicBuffer(device, 3, settings.dye_dim)

    return {
      pipeline,
      vertexBuffer,
      buffer: dyeBuffer,
      bindGroup: device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          ...dyeBuffer.buffers,
          uniformBuffers.grid_size,
          uniformBuffers.time,
          uniformBuffers.mouse,
          uniformBuffers.render_mode,
          uniformBuffers.render_intensity_multiplier,
          uniformBuffers.smoke_parameters,
        ].map((buffer, binding) => ({ binding, resource: { buffer } })),
      }),
      passDescriptor: {
        colorAttachments: [{ clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store', view: null }],
      },
    }
  }

  const createPrograms = () => {
    const program = (buffers: DynamicBuffer[], uniformBuffers: GPUBuffer[], shader: string) => {
      const pipeline = device.createComputePipeline({
        layout: 'auto',
        compute: { module: device.createShaderModule({ code: shader }), entryPoint: 'main' },
      })
      return {
        pipeline,
        bindGroup: device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [...buffers.flatMap((b) => b.buffers), ...uniformBuffers].map((buffer, binding) => ({
            binding,
            resource: { buffer },
          })),
        }),
        dim: buffers[0].dim,
      }
    }

    const { velocity, velocity0, dye, dye0, divergence, divergence0, pressure, pressure0, vorticity } = buffers
    const {
      grid_size,
      mouse,
      time,
      dt,
      velocity_force,
      velocity_radius,
      velocity_diffusion,
      dye_intensity,
      dye_radius,
      dye_diffusion,
      contain_fluid,
      viscosity: viscosity_value,
      vorticity: vorticity_value,
    } = uniformBuffers
    // Pressure programs are used multiple times.
    const pressureProgram = program([pressure, divergence, pressure0], [grid_size], shaders.pressure),
      boundaryPressureProgram = program([pressure0, pressure], [grid_size], shaders.boundaryPressure)

    const { render_mode, pressure_iterations } = settings
    return {
      compute: [
        ...(render_mode >= 1 && render_mode <= 3 ? [program([dye], [grid_size, time], shaders.checkerboard)] : []),
        // Add dye and velocity at the mouse position.
        program([dye, dye0], [grid_size, mouse, dye_intensity, dye_radius, dye_diffusion, time, dt], shaders.updateDye),
        program(
          [velocity, velocity0],
          [grid_size, mouse, velocity_force, velocity_radius, velocity_diffusion, dt, time],
          shaders.updateVelocity,
        ),
        // Advect the velocity field through itself.
        program([velocity0, velocity0, velocity], [grid_size, dt], shaders.advect),
        program([velocity, velocity0], [grid_size, contain_fluid], shaders.boundary),
        // Compute the divergence.
        program([velocity0, divergence0], [grid_size], shaders.divergence),
        program([divergence0, divergence], [grid_size], shaders.boundaryPressure),
        // Solve the jacobi-pressure equation.
        ...Array.from({ length: pressure_iterations }, () => [pressureProgram, boundaryPressureProgram]).flat(),
        // Subtract the pressure from the velocity field.
        program([pressure, velocity0, velocity], [grid_size], shaders.gradientSubtract),
        program([pressure, pressure0], [grid_size, viscosity_value], shaders.clearPressure),
        // Compute and apply vorticity confinment.
        program([velocity, vorticity], [grid_size], shaders.vorticity),
        program([velocity, vorticity, velocity0], [grid_size, dt, vorticity_value], shaders.vorticityConfinment),
        // Advect the dye through the velocity field.
        program([dye0, velocity0, dye], [grid_size, dt], shaders.advectDye),
      ],
      render: createRenderProgram(),
    }
  }

  const mouseInfo = { pos: null, last: null, velocity: null }
  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const { width, height } = canvas.getBoundingClientRect()
    mouseInfo.pos = [e.offsetX / width, 1 - e.offsetY / height]
  })

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    alphaMode: 'opaque',
  })

  buffers = initBuffers()

  let programs = createPrograms()

  const { queue } = device
  settings.reset = () => {
    buffers.velocity.clear(queue)
    buffers.dye.clear(queue)
    buffers.pressure.clear(queue)

    settings.time = 0
  }

  const updateBuffer = (buffer: GPUBuffer, value: number[]) => {
    queue.writeBuffer(buffer, 0, new Float32Array(value), 0, buffer.size / FLOAT_BYTES)
  }

  let lastFrame = performance.now()
  // Render loop
  const step = () => {
    requestAnimationFrame(step)

    const now = performance.now()
    settings.dt = Math.min(1 / 60, (now - lastFrame) / 1000) * settings.sim_speed
    settings.time += settings.dt
    lastFrame = now

    if (mouseInfo.pos) {
      mouseInfo.velocity = mouseInfo.last
        ? [mouseInfo.pos[0] - mouseInfo.last[0], mouseInfo.pos[1] - mouseInfo.last[1]]
        : [0, 0]
      mouseInfo.last = [...mouseInfo.pos]
      uniformUpdateValues.mouse = [...mouseInfo.pos, ...mouseInfo.velocity]
    }
    Object.entries(uniformUpdateValues).forEach(([name, value]) => {
      updateBuffer(uniformBuffers[name], value)
      delete uniformUpdateValues[name]
    })
    updateBuffer(uniformBuffers.dt, [parseFloat(settings.dt)])
    updateBuffer(uniformBuffers.time, [parseFloat(settings.time)])
    updateBuffer(uniformBuffers.smoke_parameters, [
      settings.raymarch_steps,
      settings.smoke_density,
      settings.enable_shadows ? 1 : 0,
      settings.shadow_intensity,
      settings.smoke_height,
      settings.light_height,
      settings.light_intensity,
      settings.light_falloff,
    ])

    const command = device.createCommandEncoder()
    const computePass = command.beginComputePass()
    programs.compute.forEach(({ pipeline, bindGroup, dim: { w, h } }) => {
      computePass.setPipeline(pipeline)
      computePass.setBindGroup(0, bindGroup)
      computePass.dispatchWorkgroups(Math.ceil(w / 8), Math.ceil(h / 8))
    })
    computePass.end()

    buffers.velocity0.copyTo(buffers.velocity, command)
    buffers.pressure0.copyTo(buffers.pressure, command)
    const { render } = programs
    // todo why can't this be pulled out of the render loop?
    const bufferForRenderMode: Record<RenderMode, DynamicBuffer> = {
      [RenderMode.Classic]: buffers.dye,
      [RenderMode.Smoke2D]: buffers.dye,
      [RenderMode.Smoke3D]: buffers.dye,
      [RenderMode.Velocity]: buffers.velocity,
      [RenderMode.Divergence]: buffers.divergence,
      [RenderMode.Pressure]: buffers.pressure,
      [RenderMode.Vorticity]: buffers.vorticity,
    }
    bufferForRenderMode[settings.render_mode].copyTo(render.buffer, command)

    render.passDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()
    const renderPass = command.beginRenderPass(render.passDescriptor)
    renderPass.setPipeline(render.pipeline)
    renderPass.setBindGroup(0, render.bindGroup)
    renderPass.setVertexBuffer(0, render.vertexBuffer)
    renderPass.draw(6)
    renderPass.end()
    queue.submit([command.finish()])
  }

  step()
}

export { main }
