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

  constructor({
    dims = 1, // Number of dimensions
    w = settings.grid_w, // Buffer width
    h = settings.grid_h, // Buffer height
  } = {}) {
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

  // Copy each buffer to another DynamicBuffer's buffers.
  // If the dimensions don't match, the last non-empty dimension will be copied instead
  copyTo(buffer: DynamicBuffer, commandEncoder: GPUCommandEncoder) {
    for (let i = 0; i < Math.max(this.dims, buffer.dims); i++) {
      commandEncoder.copyBufferToBuffer(
        this.buffers[Math.min(i, this.buffers.length - 1)],
        0,
        buffer.buffers[Math.min(i, buffer.buffers.length - 1)],
        0,
        this.bufferSize,
      )
    }
  }

  // Reset all the buffers
  clear(queue: GPUQueue) {
    for (let i = 0; i < this.dims; i++) {
      queue.writeBuffer(this.buffers[i], 0, new Float32Array(this.w * this.h))
    }
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
  addToGUI?: boolean
}

class Uniform {
  name: string
  size: number
  needsUpdate: boolean | number[]
  alwaysUpdate: boolean
  buffer: GPUBuffer

  constructor(
    name: string,
    { size, value, min, max, step, onChange, displayName, addToGUI = true }: UniformProps = {},
  ) {
    this.name = name
    this.size = size ?? (Array.isArray(value) ? value.length : 1)
    this.needsUpdate = false

    if (this.size === 1) {
      if (settings[name] == null) {
        settings[name] = value ?? 0
        this.alwaysUpdate = true
      } else if (addToGUI) {
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

  // Update the GPU buffer if the value has changed
  update(queue: GPUQueue, value = null) {
    if (!this.needsUpdate && !this.alwaysUpdate && value == null) return

    if (typeof this.needsUpdate !== 'boolean') value = this.needsUpdate
    queue.writeBuffer(this.buffer, 0, new Float32Array(value ?? [parseFloat(settings[this.name])]), 0, this.size)
    this.needsUpdate = false
  }
}

// A `Program` encompasses a shader module, compute pipeline, and bind group.
class Program {
  computePipeline: any
  bindGroup: any
  dispatchX: number
  dispatchY: number
  constructor({
    buffers = [], // Storage buffers
    uniforms = [], // Uniform buffers
    shader, // WGSL Compute Shader as a string
    dispatchX = settings.grid_w, // Dispatch workers width
    dispatchY = settings.grid_h, // Dispatch workers height
  }) {
    // Create the shader module using the WGSL string and use it
    // to create a compute pipeline with 'auto' binding layout
    this.computePipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: device.createShaderModule({ code: shader }),
        entryPoint: 'main',
      },
    })

    // Concat the buffer & uniforms and format the entries to the right WebGPU format
    let entries = buffers
      .map((b) => b.buffers)
      .flat()
      .map((buffer) => ({ buffer }))
    entries.push(...uniforms.map(({ buffer }) => ({ buffer })))
    entries = entries.map((e, i) => ({
      binding: i,
      resource: e,
    }))

    this.bindGroup = device.createBindGroup({
      layout: this.computePipeline.getBindGroupLayout(0 /* index */),
      entries: entries,
    })
    this.dispatchX = dispatchX
    this.dispatchY = dispatchY
  }

  // Dispatch the compute pipeline to the GPU
  dispatch(passEncoder) {
    passEncoder.setPipeline(this.computePipeline)
    passEncoder.setBindGroup(0, this.bindGroup)
    passEncoder.dispatchWorkgroups(Math.ceil(this.dispatchX / 8), Math.ceil(this.dispatchY / 8))
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

    const shaderModule = device.createShaderModule({
      code: renderShader,
    })

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
        targets: [
          {
            format: presentationFormat,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
    })

    // The r,g,b buffer containing the data to render
    this.buffer = new DynamicBuffer({ dims: 3, w: settings.dye_w, h: settings.dye_h })

    const entries = [
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
    }))

    this.renderBindGroup = device.createBindGroup({
      layout: this.renderPipeline.getBindGroupLayout(0),
      entries,
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

let gui, smokeFolder
let device, presentationFormat

const mouseInfos = {
  current: null,
  last: null,
  velocity: null,
}

// Buffers
let velocity, velocity0, dye, dye0, divergence, divergence0, pressure, pressure0, vorticity

// Uniforms
let uTime, uDt, uMouse, uGrid, uSimSpeed, uVelForce, uVelRadius, uVelDiff, uDyeForce, uDyeRad, uDyeDiff
let uViscosity, uVorticity, uContainFluid, uSmokeParameters, uRenderIntensity

// Programs
let checkerProgram, updateDyeProgram, updateProgram, advectProgram, boundaryProgram, divergenceProgram
let boundaryDivProgram, pressureProgram, boundaryPressureProgram, gradientSubtractProgram, advectDyeProgram
let clearPressureProgram, vorticityProgram, vorticityConfinmentProgram, renderProgram

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

const initPrograms = () => {
  checkerProgram = new Program({
    buffers: [dye],
    shader: checkerboardShader,
    dispatchX: settings.dye_w,
    dispatchY: settings.dye_h,
    uniforms: [uGrid, uTime],
  })
  updateDyeProgram = new Program({
    buffers: [dye, dye0],
    uniforms: [uGrid, uMouse, uDyeForce, uDyeRad, uDyeDiff, uTime, uDt],
    dispatchX: settings.dye_w,
    dispatchY: settings.dye_h,
    shader: updateDyeShader,
  })
  updateProgram = new Program({
    buffers: [velocity, velocity0],
    uniforms: [uGrid, uMouse, uVelForce, uVelRadius, uVelDiff, uDt, uTime],
    shader: updateVelocityShader,
  })
  advectProgram = new Program({
    buffers: [velocity0, velocity0, velocity],
    uniforms: [uGrid, uDt],
    shader: advectShader,
  })
  boundaryProgram = new Program({
    buffers: [velocity, velocity0],
    uniforms: [uGrid, uContainFluid],
    shader: boundaryShader,
  })
  divergenceProgram = new Program({
    buffers: [velocity0, divergence0],
    uniforms: [uGrid],
    shader: divergenceShader,
  })
  boundaryDivProgram = new Program({
    buffers: [divergence0, divergence],
    uniforms: [uGrid],
    shader: boundaryPressureShader,
  })
  pressureProgram = new Program({
    buffers: [pressure, divergence, pressure0],
    uniforms: [uGrid],
    shader: pressureShader,
  })
  boundaryPressureProgram = new Program({
    buffers: [pressure0, pressure],
    uniforms: [uGrid],
    shader: boundaryPressureShader,
  })
  gradientSubtractProgram = new Program({
    buffers: [pressure, velocity0, velocity],
    uniforms: [uGrid],
    shader: gradientSubtractShader,
  })
  advectDyeProgram = new Program({
    buffers: [dye0, velocity0, dye],
    uniforms: [uGrid, uDt],
    dispatchX: settings.dye_w,
    dispatchY: settings.dye_h,
    shader: advectDyeShader,
  })
  clearPressureProgram = new Program({
    buffers: [pressure, pressure0],
    uniforms: [uGrid, uViscosity],
    shader: clearPressureShader,
  })
  vorticityProgram = new Program({
    buffers: [velocity, vorticity],
    uniforms: [uGrid],
    shader: vorticityShader,
  })
  vorticityConfinmentProgram = new Program({
    buffers: [velocity, vorticity, velocity0],
    uniforms: [uGrid, uDt, uVorticity],
    shader: vorticityConfinmentShader,
  })

  renderProgram = new RenderProgram()
}

const onMouseMove = (e, canvas: HTMLCanvasElement) => {
  const { width, height } = canvas.getBoundingClientRect()

  if (!mouseInfos.current) mouseInfos.current = []
  mouseInfos.current[0] = e.offsetX / width
  mouseInfos.current[1] = 1 - e.offsetY / height // y position needs to be inverted
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

  canvas.addEventListener('mousemove', (e) => onMouseMove(e, canvas))
  presentationFormat = navigator.gpu.getPreferredCanvasFormat()
  context.configure({
    device,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    alphaMode: 'opaque',
  })

  gui = new dat.GUI()
  gui.add(settings, 'pressure_iterations', 0, 50).name('Pressure Iterations')

  gui.add(settings, 'reset').name('Clear canvas')

  smokeFolder = gui.addFolder('Smoke Parameters')
  smokeFolder.add(settings, 'raymarch_steps', 5, 20, 1).name('3D resolution')
  smokeFolder.add(settings, 'light_height', 0.5, 1, 0.001).name('Light Elevation')
  smokeFolder.add(settings, 'light_intensity', 0, 1, 0.001).name('Light Intensity')
  smokeFolder.add(settings, 'light_falloff', 0.5, 10, 0.001).name('Light Falloff')
  smokeFolder.add(settings, 'enable_shadows').name('Enable Shadows')
  smokeFolder.add(settings, 'shadow_intensity', 0, 50, 0.001).name('Shadow Intensity')
  smokeFolder.hide()

  const onSizeChange = () => {
    initSizes(canvas)
    initBuffers()
    initPrograms()
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

  new Uniform('render_mode', {
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
  gui.add(settings, 'grid_size', SIMULATION_GRID_SIZES).name('Sim. Resolution').onChange(onSizeChange)
  gui.add(settings, 'dye_size', DYE_GRID_SIZES).name('Render Resolution').onChange(onSizeChange)

  uTime = new Uniform('time')
  uDt = new Uniform('dt')
  uMouse = new Uniform('mouseInfos', { size: 4 })
  uGrid = new Uniform('gridSize', {
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
  })
  uSimSpeed = new Uniform('sim_speed', { min: 0.1, max: 20, addToGUI: false })
  uVelForce = new Uniform('velocity_add_intensity', { displayName: 'Velocity Force', min: 0, max: 0.5 })
  uVelRadius = new Uniform('velocity_add_radius', { displayName: 'Velocity Radius', min: 0, max: 0.001, step: 0.00001 })
  uVelDiff = new Uniform('velocity_diffusion', { displayName: 'Velocity Diffusion', min: 0.95, max: 1, step: 0.00001 })
  uDyeForce = new Uniform('dye_add_intensity', { displayName: 'Dye Intensity', min: 0, max: 10 })
  uDyeRad = new Uniform('dye_add_radius', { displayName: 'Dye Radius', min: 0, max: 0.01, step: 0.00001 })
  uDyeDiff = new Uniform('dye_diffusion', { displayName: 'Dye Diffusion', min: 0.95, max: 1, step: 0.00001 })
  uViscosity = new Uniform('viscosity', { displayName: 'Viscosity', min: 0, max: 1 })
  uVorticity = new Uniform('vorticity', { displayName: 'Vorticity', min: 0, max: 10, step: 0.00001 })
  uContainFluid = new Uniform('contain_fluid', { displayName: 'Solid boundaries' })
  uSmokeParameters = new Uniform('smoke_parameters', {
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
  uRenderIntensity = new Uniform('render_intensity_multiplier', { value: 1 })

  initBuffers()
  initPrograms()

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

    const command = device.createCommandEncoder()

    // Fluid simulation step
    const computePass = command.beginComputePass()
    if (settings.render_mode >= 1 && settings.render_mode <= 3) checkerProgram.dispatch(computePass)
    // Add velocity and dye at the mouse position
    updateDyeProgram.dispatch(computePass)
    updateProgram.dispatch(computePass)
    // Advect the velocity field through itself
    advectProgram.dispatch(computePass)
    boundaryProgram.dispatch(computePass) // boundary conditions
    // Compute the divergence
    divergenceProgram.dispatch(computePass)
    boundaryDivProgram.dispatch(computePass) // boundary conditions
    // Solve the jacobi-pressure equation
    for (let i = 0; i < settings.pressure_iterations; i++) {
      pressureProgram.dispatch(computePass)
      boundaryPressureProgram.dispatch(computePass) // boundary conditions
    }
    // Subtract the pressure from the velocity field
    gradientSubtractProgram.dispatch(computePass)
    clearPressureProgram.dispatch(computePass)
    // Compute & apply vorticity confinment
    vorticityProgram.dispatch(computePass)
    vorticityConfinmentProgram.dispatch(computePass)
    // Advect the dye through the velocity field
    advectDyeProgram.dispatch(computePass)
    computePass.end()

    velocity0.copyTo(velocity, command)
    pressure0.copyTo(pressure, command)
    if (settings.render_mode == 3) velocity.copyTo(renderProgram.buffer, command)
    else if (settings.render_mode == 4) divergence.copyTo(renderProgram.buffer, command)
    else if (settings.render_mode == 5) pressure.copyTo(renderProgram.buffer, command)
    else if (settings.render_mode == 6) vorticity.copyTo(renderProgram.buffer, command)
    else dye.copyTo(renderProgram.buffer, command)

    renderProgram.renderPassDescriptor.colorAttachments[0].view = canvas
      .getContext('webgpu')
      .getCurrentTexture()
      .createView()
    const renderPass = command.beginRenderPass(renderProgram.renderPassDescriptor)
    renderPass.setPipeline(renderProgram.renderPipeline)
    renderPass.setBindGroup(0, renderProgram.renderBindGroup)
    renderPass.setVertexBuffer(0, renderProgram.vertexBuffer)
    renderPass.draw(6)
    renderPass.end()
    device.queue.submit([command.finish()])
  }

  step()
}

export { main }
