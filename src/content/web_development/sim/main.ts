import * as dat from 'dat.gui'
import * as _webgpu from '@webgpu/types'

import {
  checkerboardShader,
  updateDyeShader,
  updateVelocityShader,
  advectShader,
  boundaryShader,
  boundaryPressureShader,
  divergenceShader,
  pressureShader,
  gradientSubtractShader,
  advectDyeShader,
  clearPressureShader,
  vorticityShader,
  vorticityConfinmentShader,
  renderShader,
} from './shaders'

// Manages a buffer for each dimension.
class DynamicBuffer {
  dims: number
  bufferSize: number
  w: number
  h: number
  buffers: GPUBuffer[]

  constructor({ dims = 1, w = settings.grid_w, h = settings.grid_h } = {}) {
    this.dims = dims
    this.bufferSize = w * h * 4
    this.w = w
    this.h = h
    this.buffers = Array.from({ length: dims }, () =>
      device.createBuffer({
        size: this.bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      }),
    )
  }

  copyTo(buffer: DynamicBuffer, command: GPUCommandEncoder) {
    for (let i = 0; i < Math.max(this.dims, buffer.dims); i++) {
      command.copyBufferToBuffer(
        this.buffers[Math.min(i, this.buffers.length - 1)],
        0,
        buffer.buffers[Math.min(i, buffer.buffers.length - 1)],
        0,
        this.bufferSize,
      )
    }
  }

  clear(queue: GPUQueue) {
    this.buffers.forEach((buffer) => queue.writeBuffer(buffer, 0, new Float32Array(this.w * this.h)))
  }
}

interface UniformProps {
  size?: number
  value?: number | number[]
  min?: number
  max?: number
  step?: number
  onChange?: (v: number) => void
  displayName?: string
  gui?: any
}

class Uniform {
  name: string
  size: number
  needsUpdate: boolean | number[]
  alwaysUpdate: boolean
  buffer: GPUBuffer

  constructor(name: string, { size, value, min, max, step, onChange, displayName, gui = null }: UniformProps = {}) {
    this.name = name
    this.size = size ?? (Array.isArray(value) ? value.length : 1)
    this.needsUpdate = false

    if (this.size === 1) {
      if (settings[name] == null) {
        settings[name] = value ?? 0
        this.alwaysUpdate = true
      } else if (gui) {
        gui
          .add(settings, name, min, max, step)
          .onChange((v) => {
            onChange?.(v)
            this.needsUpdate = true
          })
          .name(displayName ?? name)
      }
    }

    if (this.size === 1 || value != null) {
      this.buffer = device.createBuffer({
        size: this.size * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      })

      new Float32Array(this.buffer.getMappedRange()).set(new Float32Array(value ?? [settings[name]]))
      this.buffer.unmap()
    } else {
      this.buffer = device.createBuffer({
        size: this.size * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })
    }

    uniforms[name] = this
  }

  update(queue: GPUQueue, value = null) {
    if (!this.needsUpdate && !this.alwaysUpdate && value == null) return

    if (typeof this.needsUpdate !== 'boolean') value = this.needsUpdate
    queue.writeBuffer(this.buffer, 0, new Float32Array(value ?? [parseFloat(settings[this.name])]), 0, this.size)
    this.needsUpdate = false
  }
}

class Program {
  computePipeline: any
  bindGroup: any
  dispatchX: number
  dispatchY: number

  constructor({ buffers = [], uniforms = [], shader, dispatchX = settings.grid_w, dispatchY = settings.grid_h }) {
    this.computePipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: device.createShaderModule({ code: shader }),
        entryPoint: 'main',
      },
    })
    this.bindGroup = device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0),
      entries: [
        ...buffers.flatMap((b) => b.buffers).map((buffer) => ({ buffer })),
        ...uniforms.map(({ buffer }) => ({ buffer })),
      ].map((e, i) => ({ binding: i, resource: e })),
    })
    this.dispatchX = dispatchX
    this.dispatchY = dispatchY
  }

  dispatch(pass: GPUComputePassEncoder) {
    pass.setPipeline(this.computePipeline)
    pass.setBindGroup(0, this.bindGroup)
    pass.dispatchWorkgroups(Math.ceil(this.dispatchX / 8), Math.ceil(this.dispatchY / 8))
  }
}

const uniforms: Record<string, Uniform> = {}

const settings = {
  render_mode: 0,
  grid_size: 128,
  grid_w: 1024,
  grid_h: 1024,
  reset: () => {},

  dye_size: 1024,
  sim_speed: 5,
  contain_fluid: true,
  velocity_add_intensity: 0.2,
  velocity_add_radius: 0.0002,
  velocity_diffusion: 0.9999,
  dye_add_intensity: 1,
  dye_add_radius: 0.001,
  dye_diffusion: 0.98,
  dye_w: 1024,
  dye_h: 1024,
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

// Renders 3 (r, g, b) storage buffers to the canvas
class RenderProgram {
  vertexBuffer: any
  renderPipeline: any
  buffer: any
  renderBindGroup: any
  renderPassDescriptor: {
    colorAttachments: {
      clearValue: { r: number; g: number; b: number; a: number }
      loadOp: GPULoadOp
      storeOp: GPUStoreOp
      view: GPUTextureView | null
    }[]
  }
  constructor() {
    const vertices = new Float32Array([-1, -1, 0, 1, -1, 1, 0, 1, 1, -1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, 1, 1, 0, 1])

    this.vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices)
    this.vertexBuffer.unmap()

    const vertexBuffersDescriptors = [
      {
        attributes: [
          {
            shaderLocation: 0,
            offset: 0,
            format: 'float32x4',
          },
        ],
        arrayStride: 16,
        stepMode: 'vertex',
      },
    ]

    const shaderModule = device.createShaderModule({ code: renderShader })
    this.renderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vertex_main',
        buffers: vertexBuffersDescriptors,
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fragment_main',
        targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }],
      },
      primitive: {
        topology: 'triangle-list',
      },
    })

    // The r,g,b buffer containing the data to render
    this.buffer = new DynamicBuffer({ dims: 3, w: settings.dye_w, h: settings.dye_h })

    this.renderBindGroup = device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries: [
        ...this.buffer.buffers,
        uniforms.gridSize.buffer,
        uniforms.time.buffer,
        uniforms.mouseInfos.buffer,
        uniforms.render_mode.buffer,
        uniforms.render_intensity_multiplier.buffer,
        uniforms.smoke_parameters.buffer,
      ].map((b, i) => ({
        binding: i,
        resource: { buffer: b },
      })),
    })

    this.renderPassDescriptor = {
      colorAttachments: [
        {
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
          view: null,
        },
      ],
    }
  }
}

let device

const RENDER_MODES = {
  Classic: 0,
  'Smoke 2D': 1,
  'Smoke 3D + Shadows': 2,
  'Debug - Velocity': 3,
  'Debug - Divergence': 4,
  'Debug - Pressure': 5,
  'Debug - Vorticity': 6,
}
const SIMULATION_GRID_SIZES = [32, 64, 128, 256, 512, 1024]
const DYE_GRID_SIZES = [128, 256, 512, 1024, 2048]

const main = async (canvas: HTMLCanvasElement) => {
  if (navigator.gpu == null) throw 'WebGPU NOT Supported'

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw 'No adapter found'

  device = await adapter.requestDevice()
  const context = canvas.getContext('webgpu')
  if (!context) throw 'Canvas does not support WebGPU'

  // Buffers
  let velocity, velocity0, dye, dye0, divergence, divergence0, pressure, pressure0, vorticity
  const initBuffers = () => {
    velocity = new DynamicBuffer({ dims: 2 })
    velocity0 = new DynamicBuffer({ dims: 2 })
    dye = new DynamicBuffer({ dims: 3, w: settings.dye_w, h: settings.dye_h })
    dye0 = new DynamicBuffer({ dims: 3, w: settings.dye_w, h: settings.dye_h })
    divergence = new DynamicBuffer()
    divergence0 = new DynamicBuffer()
    pressure = new DynamicBuffer()
    pressure0 = new DynamicBuffer()
    vorticity = new DynamicBuffer()
  }

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
    settings.grid_w = gridSize.w
    settings.grid_h = gridSize.h

    const dyeSize = getPreferredDimensions(settings.dye_size)
    settings.dye_w = dyeSize.w
    settings.dye_h = dyeSize.h

    settings.rdx = settings.grid_size * 4
    settings.dyeRdx = settings.dye_size * 4
    settings.dx = 1 / settings.rdx

    canvas.width = settings.dye_w
    canvas.height = settings.dye_h
  }

  const onSizeChange = () => {
    initSizes(canvas)
    initBuffers()
    programs = createPrograms()
    uniforms.gridSize.needsUpdate = [
      settings.grid_w,
      settings.grid_h,
      settings.dye_w,
      settings.dye_h,
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
  gui.add(settings, 'grid_size', SIMULATION_GRID_SIZES).name('Sim. Resolution').onChange(onSizeChange)
  gui.add(settings, 'dye_size', DYE_GRID_SIZES).name('Render Resolution').onChange(onSizeChange)

  // Uniforms
  new Uniform('render_intensity_multiplier', { value: 1 })
  new Uniform('render_mode', {
    gui,
    displayName: 'Render Mode',
    min: RENDER_MODES,
    size: 1,
    onChange: (val) => {
      settings.render_intensity_multiplier = [1, 1, 1, 100, 10, 1e6, 1][parseInt(val)]
      uniforms.render_intensity_multiplier.needsUpdate = true
      if (val == 2) smokeFolder.show(), smokeFolder.open()
      else smokeFolder.hide()
    },
  })
  new Uniform('sim_speed', { min: 0.1, max: 20 })
  const uTime = new Uniform('time'),
    uDt = new Uniform('dt'),
    uMouse = new Uniform('mouseInfos', { size: 4 }),
    uGrid = new Uniform('gridSize', {
      gui,
      size: 7,
      value: [
        settings.grid_w,
        settings.grid_h,
        settings.dye_w,
        settings.dye_h,
        settings.dx,
        settings.rdx,
        settings.dyeRdx,
      ],
    }),
    uVelForce = new Uniform('velocity_add_intensity', { gui, displayName: 'Velocity Force', min: 0, max: 0.5 }),
    uVelRadius = new Uniform('velocity_add_radius', { gui, displayName: 'Velocity Radius', min: 0, max: 0.001 }),
    uVelDiff = new Uniform('velocity_diffusion', { gui, displayName: 'Velocity Diffusion', min: 0.95, max: 1 }),
    uDyeForce = new Uniform('dye_add_intensity', { gui, displayName: 'Dye Intensity', min: 0, max: 10 }),
    uDyeRad = new Uniform('dye_add_radius', { gui, displayName: 'Dye Radius', min: 0, max: 0.01 }),
    uDyeDiff = new Uniform('dye_diffusion', { gui, displayName: 'Dye Diffusion', min: 0.95, max: 1 }),
    uViscosity = new Uniform('viscosity', { gui, displayName: 'Viscosity', min: 0, max: 1 }),
    uVorticity = new Uniform('vorticity', { gui, displayName: 'Vorticity', min: 0, max: 10 }),
    uContainFluid = new Uniform('contain_fluid', { gui, displayName: 'Solid boundaries' }),
    uSmokeParameters = new Uniform('smoke_parameters', {
      gui,
      value: [
        settings.raymarch_steps,
        settings.smoke_density,
        settings.enable_shadows,
        settings.shadow_intensity,
        settings.smoke_height,
        settings.light_height,
        settings.light_intensity,
        settings.light_falloff,
      ],
    })

  const createPrograms = () => ({
    checker: new Program({
      buffers: [dye],
      shader: checkerboardShader,
      dispatchX: settings.dye_w,
      dispatchY: settings.dye_h,
      uniforms: [uGrid, uTime],
    }),
    updateDye: new Program({
      buffers: [dye, dye0],
      uniforms: [uGrid, uMouse, uDyeForce, uDyeRad, uDyeDiff, uTime, uDt],
      dispatchX: settings.dye_w,
      dispatchY: settings.dye_h,
      shader: updateDyeShader,
    }),
    update: new Program({
      buffers: [velocity, velocity0],
      uniforms: [uGrid, uMouse, uVelForce, uVelRadius, uVelDiff, uDt, uTime],
      shader: updateVelocityShader,
    }),
    advect: new Program({
      buffers: [velocity0, velocity0, velocity],
      uniforms: [uGrid, uDt],
      shader: advectShader,
    }),
    boundary: new Program({
      buffers: [velocity, velocity0],
      uniforms: [uGrid, uContainFluid],
      shader: boundaryShader,
    }),
    divergence: new Program({
      buffers: [velocity0, divergence0],
      uniforms: [uGrid],
      shader: divergenceShader,
    }),
    boundaryDiv: new Program({
      buffers: [divergence0, divergence],
      uniforms: [uGrid],
      shader: boundaryPressureShader,
    }),
    pressure: new Program({
      buffers: [pressure, divergence, pressure0],
      uniforms: [uGrid],
      shader: pressureShader,
    }),
    boundaryPressure: new Program({
      buffers: [pressure0, pressure],
      uniforms: [uGrid],
      shader: boundaryPressureShader,
    }),
    gradientSubtract: new Program({
      buffers: [pressure, velocity0, velocity],
      uniforms: [uGrid],
      shader: gradientSubtractShader,
    }),
    advectDye: new Program({
      buffers: [dye0, velocity0, dye],
      uniforms: [uGrid, uDt],
      dispatchX: settings.dye_w,
      dispatchY: settings.dye_h,
      shader: advectDyeShader,
    }),
    clearPressure: new Program({
      buffers: [pressure, pressure0],
      uniforms: [uGrid, uViscosity],
      shader: clearPressureShader,
    }),
    vorticity: new Program({
      buffers: [velocity, vorticity],
      uniforms: [uGrid],
      shader: vorticityShader,
    }),
    vorticityConfinment: new Program({
      buffers: [velocity, vorticity, velocity0],
      uniforms: [uGrid, uDt, uVorticity],
      shader: vorticityConfinmentShader,
    }),
    render: new RenderProgram(),
  })

  const mouseInfos = { current: null, last: null, velocity: null }
  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const { width, height } = canvas.getBoundingClientRect()
    mouseInfos.current = [e.offsetX / width, 1 - e.offsetY / height]
  })

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    alphaMode: 'opaque',
  })

  const smokeFolder = gui.addFolder('Smoke Parameters')
  smokeFolder.add(settings, 'raymarch_steps', 5, 20, 1).name('3D resolution')
  smokeFolder.add(settings, 'light_height', 0.5, 1, 0.001).name('Light Elevation')
  smokeFolder.add(settings, 'light_intensity', 0, 1, 0.001).name('Light Intensity')
  smokeFolder.add(settings, 'light_falloff', 0.5, 10, 0.001).name('Light Falloff')
  smokeFolder.add(settings, 'enable_shadows').name('Enable Shadows')
  smokeFolder.add(settings, 'shadow_intensity', 0, 50, 0.001).name('Shadow Intensity')
  smokeFolder.hide()

  initBuffers()
  let programs = createPrograms()

  settings.reset = () => {
    velocity.clear(device.queue)
    dye.clear(device.queue)
    pressure.clear(device.queue)

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

    Object.values(uniforms).forEach((u) => u.update(device.queue))

    if (mouseInfos.current) {
      mouseInfos.velocity = mouseInfos.last
        ? [mouseInfos.current[0] - mouseInfos.last[0], mouseInfos.current[1] - mouseInfos.last[1]]
        : [0, 0]
      uMouse.update(device.queue, [...mouseInfos.current, ...mouseInfos.velocity])
      mouseInfos.last = [...mouseInfos.current]
    }
    uSmokeParameters.update(device.queue, [
      settings.raymarch_steps,
      settings.smoke_density,
      settings.enable_shadows,
      settings.shadow_intensity,
      settings.smoke_height,
      settings.light_height,
      settings.light_intensity,
      settings.light_falloff,
    ])

    const simulationPrograms = [
      settings.render_mode >= 1 && settings.render_mode <= 3 ? programs.checker : null,
      // Add velocity and dye at the mouse position.
      programs.updateDye,
      programs.update,
      // Advect the velocity field through itself.
      programs.advect,
      programs.boundary,
      // Compute the divergence.
      programs.divergence,
      programs.boundaryDiv,
      // Solve the jacobi-pressure equation.
      ...Array.from({ length: settings.pressure_iterations }, () => [
        programs.pressure,
        programs.boundaryPressure,
      ]).flat(),
      // Subtract the pressure from the velocity field.
      programs.gradientSubtract,
      programs.clearPressure,
      // Compute & apply vorticity confinment.
      programs.vorticity,
      programs.vorticityConfinment,
      // Advect the dye through the velocity field.
      programs.advectDye,
    ]
    const command = device.createCommandEncoder()
    const computePass = command.beginComputePass()
    simulationPrograms.forEach((program) => program?.dispatch(computePass))
    computePass.end()

    velocity0.copyTo(velocity, command)
    pressure0.copyTo(pressure, command)
    const renderBuffer = programs.render.buffer
    if (settings.render_mode == 3) velocity.copyTo(renderBuffer, command)
    else if (settings.render_mode == 4) divergence.copyTo(renderBuffer, command)
    else if (settings.render_mode == 5) pressure.copyTo(renderBuffer, command)
    else if (settings.render_mode == 6) vorticity.copyTo(renderBuffer, command)
    else dye.copyTo(renderBuffer, command)

    programs.render.renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()
    const renderPass = command.beginRenderPass(programs.render.renderPassDescriptor)
    renderPass.setPipeline(programs.render.renderPipeline)
    renderPass.setBindGroup(0, programs.render.renderBindGroup)
    renderPass.setVertexBuffer(0, programs.render.vertexBuffer)
    renderPass.draw(6)
    renderPass.end()
    device.queue.submit([command.finish()])
  }

  step()
}

export { main }
