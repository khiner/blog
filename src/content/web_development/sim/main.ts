import * as dat from 'dat.gui'
import * as _webgpu from '@webgpu/types'

import shaders from './shaders'

interface Dimension {
  w: number
  h: number
}

// Manages a buffer for each dimension.
class DynamicBuffer {
  nDims: number
  dim: Dimension
  buffers: GPUBuffer[]

  constructor({ nDims, dim }: { nDims: number; dim: Dimension }) {
    this.nDims = nDims
    this.dim = dim
    this.buffers = Array.from({ length: nDims }, () =>
      device.createBuffer({
        size: dim.w * dim.h * 4,
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
        this.dim.w * this.dim.h * 4,
      )
    }
  }

  clear(queue: GPUQueue) {
    this.buffers.forEach((buffer) => queue.writeBuffer(buffer, 0, new Float32Array(this.dim.w * this.dim.h)))
  }
}

interface UniformProps {
  size?: number
  value?: number | number[]
  min?: number
  max?: number
  step?: number
  onChange?: (v: number) => void
  label?: string
  gui?: any
}

interface Uniform {
  name: string
  size: number
  needsUpdate: boolean | number[]
  alwaysUpdate: boolean
  buffer: GPUBuffer
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

let device

const main = async (canvas: HTMLCanvasElement) => {
  if (navigator.gpu == null) throw 'WebGPU NOT Supported'

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw 'No adapter found'

  device = await adapter.requestDevice()
  const context = canvas.getContext('webgpu')
  if (!context) throw 'Canvas does not support WebGPU'

  const onWebGPUDetectionError = (error) => {
    console.log('Could not initialize WebGPU: ' + error)
    document.querySelector('.webgpu-not-supported').style.visibility = 'visible'
    return false
  }

  // Init buffer & canvas dimensions to fit the screen while keeping the aspect ratio
  // and downscaling the dimensions if they exceed the browsers capabilities
  const initSizes = (canvas: HTMLCanvasElement) => {
    const aspectRatio = window.innerWidth / window.innerHeight
    const maxBufferSize = device.limits.maxStorageBufferBindingSize
    const maxCanvasSize = device.limits.maxTextureDimension2D

    const getPreferredDimensions = (size: number) => {
      let w, h
      // Fit to screen while keeping the aspect ratio
      if (window.innerHeight < window.innerWidth) {
        w = Math.floor(size * aspectRatio)
        h = size
      } else {
        w = size
        h = Math.floor(size / aspectRatio)
      }

      // Downscale if necessary to prevent buffer/canvas size overflow
      let downRatio = 1
      if (w * h * 4 >= maxBufferSize) downRatio = Math.sqrt(maxBufferSize / (w * h * 4))
      if (w > maxCanvasSize) downRatio = maxCanvasSize / w
      else if (h > maxCanvasSize) downRatio = maxCanvasSize / h

      return {
        w: Math.floor(w * downRatio),
        h: Math.floor(h * downRatio),
      }
    }

    const gridSize = getPreferredDimensions(settings.grid_size)
    settings.grid_dim = { w: gridSize.w, h: gridSize.h }

    const dyeSize = getPreferredDimensions(settings.dye_size)
    settings.dye_dim = { w: dyeSize.w, h: dyeSize.h }

    settings.rdx = settings.grid_size * 4
    settings.dyeRdx = settings.dye_size * 4
    settings.dx = 1 / settings.rdx

    canvas.width = settings.dye_dim.w
    canvas.height = settings.dye_dim.h
  }

  let buffers: Record<string, DynamicBuffer>

  // Buffers
  const initBuffers = () => {
    return {
      velocity: new DynamicBuffer({ nDims: 2, dim: settings.grid_dim }),
      velocity0: new DynamicBuffer({ nDims: 2, dim: settings.grid_dim }),
      dye: new DynamicBuffer({ nDims: 3, dim: settings.dye_dim }),
      dye0: new DynamicBuffer({ nDims: 3, dim: settings.dye_dim }),
      divergence: new DynamicBuffer({ nDims: 1, dim: settings.grid_dim }),
      divergence0: new DynamicBuffer({ nDims: 1, dim: settings.grid_dim }),
      pressure: new DynamicBuffer({ nDims: 1, dim: settings.grid_dim }),
      pressure0: new DynamicBuffer({ nDims: 1, dim: settings.grid_dim }),
      vorticity: new DynamicBuffer({ nDims: 1, dim: settings.grid_dim }),
    }
  }

  const uniforms: Record<string, Uniform> = {}

  const onSizeChange = () => {
    initSizes(canvas)
    buffers = initBuffers()
    programs = createPrograms()
    uniforms.grid_size.needsUpdate = [
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

  const updateUniform = (uniform: Uniform, queue: GPUQueue, value = null) => {
    if (!uniform.needsUpdate && !uniform.alwaysUpdate && value == null) return

    if (typeof uniform.needsUpdate !== 'boolean') value = uniform.needsUpdate
    queue.writeBuffer(
      uniform.buffer,
      0,
      new Float32Array(value ?? [parseFloat(settings[uniform.name])]),
      0,
      uniform.size,
    )
    uniform.needsUpdate = false
  }

  const uniformProps: Record<string, UniformProps> = {
    render_intensity_multiplier: { value: 1 },
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
      value: 0,
      onChange: (val) => {
        settings.render_intensity_multiplier = [1, 1, 1, 100, 10, 1e6, 1][parseInt(val)]
        uniforms.render_intensity_multiplier.needsUpdate = true
        if (val == RenderMode.Smoke3D) smokeFolder.show(), smokeFolder.open()
        else smokeFolder.hide()
      },
    },
    time: {},
    dt: {},
    sim_speed: { min: 0.1, max: 20 },
    velocity_force: { label: 'Velocity Force', min: 0, max: 0.5 },
    velocity_radius: { label: 'Velocity Radius', min: 0, max: 0.001 },
    velocity_diffusion: { label: 'Velocity Diffusion', min: 0.95, max: 1 },
    dye_intensity: { label: 'Dye Intensity', min: 0, max: 10 },
    dye_radius: { label: 'Dye Radius', min: 0, max: 0.01 },
    dye_diffusion: { label: 'Dye Diffusion', min: 0.95, max: 1 },
    viscosity_amount: { label: 'Viscosity', min: 0, max: 1 },
    vorticity_amount: { label: 'Vorticity', min: 0, max: 10 },
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
    const uniformSize = size ?? (Array.isArray(value) ? value.length : 1)
    let needsUpdate = false
    let alwaysUpdate = false
    let buffer: GPUBuffer

    if (uniformSize === 1) {
      if (settings[name] == null) {
        settings[name] = value ?? 0
        alwaysUpdate = true
      } else if (label) {
        gui
          .add(settings, name, min, max, step)
          .onChange((v) => {
            onChange?.(v)
            needsUpdate = true
          })
          .name(label ?? name)
      }
    }

    if (uniformSize === 1 || value != null) {
      buffer = device.createBuffer({
        size: uniformSize * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      })

      new Float32Array(buffer.getMappedRange()).set(new Float32Array(value ?? [settings[name]]))
      buffer.unmap()
    } else {
      buffer = device.createBuffer({
        size: uniformSize * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })
    }

    uniforms[name] = { name, size: uniformSize, needsUpdate, alwaysUpdate, buffer }
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
            arrayStride: 16,
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
    const dyeBuffer = new DynamicBuffer({ nDims: 3, dim: settings.dye_dim })

    return {
      pipeline,
      vertexBuffer,
      buffer: dyeBuffer,
      bindGroup: device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          ...dyeBuffer.buffers,
          uniforms.grid_size.buffer,
          uniforms.time.buffer,
          uniforms.mouse.buffer,
          uniforms.render_mode.buffer,
          uniforms.render_intensity_multiplier.buffer,
          uniforms.smoke_parameters.buffer,
        ].map((buffer, binding) => ({ binding, resource: { buffer } })),
      }),
      passDescriptor: {
        colorAttachments: [{ clearValue: { r: 0, g: 0, b: 0, a: 1 }, loadOp: 'clear', storeOp: 'store', view: null }],
      },
    }
  }

  const createPrograms = () => {
    const program = (buffers: DynamicBuffer[], uniforms: Uniform[], shader: string) => {
      const pipeline = device.createComputePipeline({
        layout: 'auto',
        compute: { module: device.createShaderModule({ code: shader }), entryPoint: 'main' },
      })
      return {
        pipeline,
        bindGroup: device.createBindGroup({
          layout: pipeline.getBindGroupLayout(0),
          entries: [...buffers.flatMap((b) => b.buffers), ...uniforms.map((u) => u.buffer)].map((buffer, binding) => ({
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
      viscosity_amount,
      vorticity_amount,
    } = uniforms
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
        program([pressure, pressure0], [grid_size, viscosity_amount], shaders.clearPressure),
        // Compute & apply vorticity confinment.
        program([velocity, vorticity], [grid_size], shaders.vorticity),
        program([velocity, vorticity, velocity0], [grid_size, dt, vorticity_amount], shaders.vorticityConfinment),
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

  settings.reset = () => {
    buffers.velocity.clear(device.queue)
    buffers.dye.clear(device.queue)
    buffers.pressure.clear(device.queue)

    settings.time = 0
  }

  let lastFrame = performance.now()
  // Render loop
  const step = () => {
    requestAnimationFrame(step)

    const now = performance.now()
    settings.dt = Math.min(1 / 60, (now - lastFrame) / 1000) * settings.sim_speed
    settings.time += settings.dt
    lastFrame = now

    Object.values(uniforms).forEach((u) => updateUniform(u, device.queue))

    if (mouseInfo.pos) {
      mouseInfo.velocity = mouseInfo.last
        ? [mouseInfo.pos[0] - mouseInfo.last[0], mouseInfo.pos[1] - mouseInfo.last[1]]
        : [0, 0]
      updateUniform(uniforms.mouse, device.queue, [...mouseInfo.pos, ...mouseInfo.velocity])
      mouseInfo.last = [...mouseInfo.pos]
    }
    updateUniform(uniforms.smoke_parameters, device.queue, [
      settings.raymarch_steps,
      settings.smoke_density,
      settings.enable_shadows,
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

    const { render } = programs
    buffers.velocity0.copyTo(buffers.velocity, command)
    buffers.pressure0.copyTo(buffers.pressure, command)
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
    device.queue.submit([command.finish()])
  }

  step()
}

export { main }
