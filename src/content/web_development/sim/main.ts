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

// Creates and manage multi-dimensional buffers by creating a buffer for each dimension
class DynamicBuffer {
  constructor({
    dims = 1, // Number of dimensions
    w = settings.grid_w, // Buffer width
    h = settings.grid_h, // Buffer height
  } = {}) {
    this.dims = dims
    this.bufferSize = w * h * 4
    this.w = w
    this.h = h
    this.buffers = new Array(dims).fill().map((_) =>
      device.createBuffer({
        size: this.bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      }),
    )
  }

  // Copy each buffer to another DynamicBuffer's buffers.
  // If the dimensions don't match, the last non-empty dimension will be copied instead
  copyTo(buffer, commandEncoder) {
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
  clear(queue) {
    for (let i = 0; i < this.dims; i++) {
      queue.writeBuffer(this.buffers[i], 0, new Float32Array(this.w * this.h))
    }
  }
}

// Manage uniform buffers relative to the compute shaders & the gui
class Uniform {
  constructor(name, { size, value, min, max, step, onChange, displayName, addToGUI = true } = {}) {
    this.name = name
    this.size = size ?? (typeof value === 'object' ? value.length : 1)
    this.needsUpdate = false

    if (this.size === 1) {
      if (settings[name] == null) {
        settings[name] = value ?? 0
        this.alwaysUpdate = true
      } else if (addToGUI) {
        gui
          .add(settings, name, min, max, step)
          .onChange((v) => {
            if (onChange) onChange(v)
            this.needsUpdate = true
          })
          .name(displayName ?? name)
      }
    }

    if (this.size === 1 || value != null) {
      this.buffer = device.createBuffer({
        mappedAtCreation: true,
        size: this.size * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      const arrayBuffer = this.buffer.getMappedRange()
      new Float32Array(arrayBuffer).set(new Float32Array(value ?? [settings[name]]))
      this.buffer.unmap()
    } else {
      this.buffer = device.createBuffer({
        size: this.size * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })
    }

    globalUniforms[name] = this
  }

  setValue(value) {
    settings[this.name] = value
    this.needsUpdate = true
  }

  // Update the GPU buffer if the value has changed
  update(queue, value) {
    if (this.needsUpdate || this.alwaysUpdate || value != null) {
      if (typeof this.needsUpdate !== 'boolean') value = this.needsUpdate
      queue.writeBuffer(this.buffer, 0, new Float32Array(value ?? [parseFloat(settings[this.name])]), 0, this.size)
      this.needsUpdate = false
    }
  }
}

// Creates a shader module, compute pipeline & bind group to use with the GPU
class Program {
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

    // Create the bind group using these entries & auto-layout detection
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

const globalUniforms = {}

let settings = {
  render_mode: 0,
  grid_size: 128,
  grid_w: 1024,
  grid_h: 1024,
  reset: function () {},

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
  input_symmetry: 'none',

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

    // Uniforms
    const entries = [
      ...this.buffer.buffers,
      globalUniforms.gridSize.buffer,
      globalUniforms.time.buffer,
      globalUniforms.mouseInfos.buffer,
      globalUniforms.render_mode.buffer,
      globalUniforms.render_intensity_multiplier.buffer,
      globalUniforms.smoke_parameters.buffer,
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

  // Dispatch a draw command to render on the canvas
  dispatch(commandEncoder, canvas) {
    this.renderPassDescriptor.colorAttachments[0].view = canvas.getContext('webgpu').getCurrentTexture().createView()

    const renderPassEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor)
    renderPassEncoder.setPipeline(this.renderPipeline)
    renderPassEncoder.setBindGroup(0, this.renderBindGroup)
    renderPassEncoder.setVertexBuffer(0, this.vertexBuffer)
    renderPassEncoder.draw(6)
    renderPassEncoder.end()
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
let uRenderMode, time, dt, mouse, grid, uSimSpeed, vel_force, vel_radius, vel_diff, dye_force, dye_radius, dye_diff
let viscosity, uVorticity, containFluid, uSymmetry, uSmokeParameters, uRenderIntensity

// Programs
let checkerProgram, updateDyeProgram, updateProgram, advectProgram, boundaryProgram, divergenceProgram
let boundaryDivProgram, pressureProgram, boundaryPressureProgram, gradientSubtractProgram, advectDyeProgram
let clearPressureProgram, vorticityProgram, vorticityConfinmentProgram, renderProgram

function initBuffers() {
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

// Useful classes for cleaner understanding of the input and output buffers
// used in the declarations of programs & fluid simulation steps

class AdvectProgram extends Program {
  constructor({ in_quantity, in_velocity, out_quantity, uniforms, shader = advectShader, ...props }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_quantity, in_velocity, out_quantity], uniforms, shader, ...props })
  }
}

class DivergenceProgram extends Program {
  constructor({ in_velocity, out_divergence, uniforms, shader = divergenceShader }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_velocity, out_divergence], uniforms, shader })
  }
}

class PressureProgram extends Program {
  constructor({ in_pressure, in_divergence, out_pressure, uniforms, shader = pressureShader }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_pressure, in_divergence, out_pressure], uniforms, shader })
  }
}

class GradientSubtractProgram extends Program {
  constructor({ in_pressure, in_velocity, out_velocity, uniforms, shader = gradientSubtractShader }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_pressure, in_velocity, out_velocity], uniforms, shader })
  }
}

class BoundaryProgram extends Program {
  constructor({ in_quantity, out_quantity, uniforms, shader = boundaryShader }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_quantity, out_quantity], uniforms, shader })
  }
}

class UpdateProgram extends Program {
  constructor({ in_quantity, out_quantity, uniforms, shader = updateVelocityShader, ...props }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_quantity, out_quantity], uniforms, shader, ...props })
  }
}

class VorticityProgram extends Program {
  constructor({ in_velocity, out_vorticity, uniforms, shader = vorticityShader, ...props }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_velocity, out_vorticity], uniforms, shader, ...props })
  }
}

class VorticityConfinmentProgram extends Program {
  constructor({ in_velocity, in_vorticity, out_velocity, uniforms, shader = vorticityConfinmentShader, ...props }) {
    uniforms ??= [globalUniforms.gridSize]
    super({ buffers: [in_velocity, in_vorticity, out_velocity], uniforms, shader, ...props })
  }
}

function initUniforms(canvas) {
  uRenderMode = new Uniform('render_mode', {
    displayName: 'Render Mode',
    size: 1,
    min: RENDER_MODES,
    onChange: (val) => {
      globalUniforms.render_intensity_multiplier.setValue([1, 1, 1, 100, 10, 1e6, 1][parseInt(val)])
      if (val == 2) smokeFolder.show(), smokeFolder.open()
      else smokeFolder.hide()
    },
  })
  gui
    .add(settings, 'grid_size', SIMULATION_GRID_SIZES)
    .name('Sim. Resolution')
    .onChange(() => refreshSizes(canvas))
  gui
    .add(settings, 'dye_size', DYE_GRID_SIZES)
    .name('Render Resolution')
    .onChange(() => refreshSizes(canvas))

  time = new Uniform('time')
  dt = new Uniform('dt')
  mouse = new Uniform('mouseInfos', { size: 4 })
  grid = new Uniform('gridSize', {
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
  vel_force = new Uniform('velocity_add_intensity', { displayName: 'Velocity Force', min: 0, max: 0.5 })
  vel_radius = new Uniform('velocity_add_radius', { displayName: 'Velocity Radius', min: 0, max: 0.001, step: 0.00001 })
  vel_diff = new Uniform('velocity_diffusion', { displayName: 'Velocity Diffusion', min: 0.95, max: 1, step: 0.00001 })
  dye_force = new Uniform('dye_add_intensity', { displayName: 'Dye Intensity', min: 0, max: 10 })
  dye_radius = new Uniform('dye_add_radius', { displayName: 'Dye Radius', min: 0, max: 0.01, step: 0.00001 })
  dye_diff = new Uniform('dye_diffusion', { displayName: 'Dye Diffusion', min: 0.95, max: 1, step: 0.00001 })
  viscosity = new Uniform('viscosity', { displayName: 'Viscosity', min: 0, max: 1 })
  uVorticity = new Uniform('vorticity', { displayName: 'Vorticity', min: 0, max: 10, step: 0.00001 })
  containFluid = new Uniform('contain_fluid', { displayName: 'Solid boundaries' })
  uSymmetry = new Uniform('mouse_type', { value: 0 })
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
}

function initPrograms(canvas) {
  checkerProgram = new Program({
    buffers: [dye],
    shader: checkerboardShader,
    dispatchX: settings.dye_w,
    dispatchY: settings.dye_h,
    uniforms: [grid, time],
  })

  updateDyeProgram = new UpdateProgram({
    in_quantity: dye,
    out_quantity: dye0,
    uniforms: [grid, mouse, dye_force, dye_radius, dye_diff, time, dt, uSymmetry],
    dispatchX: settings.dye_w,
    dispatchY: settings.dye_h,
    shader: updateDyeShader,
  })

  updateProgram = new UpdateProgram({
    in_quantity: velocity,
    out_quantity: velocity0,
    uniforms: [grid, mouse, vel_force, vel_radius, vel_diff, dt, time, uSymmetry],
  })

  advectProgram = new AdvectProgram({
    in_quantity: velocity0,
    in_velocity: velocity0,
    out_quantity: velocity,
    uniforms: [grid, dt],
  })

  boundaryProgram = new BoundaryProgram({
    in_quantity: velocity,
    out_quantity: velocity0,
    uniforms: [grid, containFluid],
  })

  divergenceProgram = new DivergenceProgram({
    in_velocity: velocity0,
    out_divergence: divergence0,
  })

  boundaryDivProgram = new BoundaryProgram({
    in_quantity: divergence0,
    out_quantity: divergence,
    shader: boundaryPressureShader,
  })

  pressureProgram = new PressureProgram({
    in_pressure: pressure,
    in_divergence: divergence,
    out_pressure: pressure0,
  })

  boundaryPressureProgram = new BoundaryProgram({
    in_quantity: pressure0,
    out_quantity: pressure,
    shader: boundaryPressureShader,
  })

  gradientSubtractProgram = new GradientSubtractProgram({
    in_pressure: pressure,
    in_velocity: velocity0,
    out_velocity: velocity,
  })

  advectDyeProgram = new AdvectProgram({
    in_quantity: dye0,
    in_velocity: velocity,
    out_quantity: dye,
    uniforms: [grid, dt],
    dispatchX: settings.dye_w,
    dispatchY: settings.dye_h,
    shader: advectDyeShader,
  })

  clearPressureProgram = new UpdateProgram({
    in_quantity: pressure,
    out_quantity: pressure0,
    uniforms: [grid, viscosity],
    shader: clearPressureShader,
  })

  vorticityProgram = new VorticityProgram({
    in_velocity: velocity,
    out_vorticity: vorticity,
  })

  vorticityConfinmentProgram = new VorticityConfinmentProgram({
    in_velocity: velocity,
    in_vorticity: vorticity,
    out_velocity: velocity0,
    uniforms: [grid, dt, uVorticity],
  })

  renderProgram = new RenderProgram()
}

function onMouseMove(e, canvas: HTMLCanvasElement) {
  const { width, height } = canvas.getBoundingClientRect()

  if (!mouseInfos.current) mouseInfos.current = []
  mouseInfos.current[0] = e.offsetX / width
  mouseInfos.current[1] = 1 - e.offsetY / height // y position needs to be inverted
}

function onWebGPUDetectionError(error) {
  console.log('Could not initialize WebGPU: ' + error)
  document.querySelector('.webgpu-not-supported').style.visibility = 'visible'
  return false
}

// Init the WebGPU context by checking first if everything is supported.
// Returns true on init success, false otherwise.
async function initContext(canvas: HTMLCanvasElement) {
  if (navigator.gpu == null) throw 'WebGPU NOT Supported'

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw 'No adapter found'

  device = await adapter.requestDevice()

  const context = canvas.getContext('webgpu')
  if (!context) throw 'Canvas does not support WebGPU'

  // If we got here, WebGPU is supported.
  canvas.addEventListener('mousemove', (e) => onMouseMove(e, canvas))
  gui = new dat.GUI()
  presentationFormat = navigator.gpu.getPreferredCanvasFormat(adapter)
  context.configure({
    device,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
    alphaMode: 'opaque',
  })

  initSizes(canvas)

  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => refreshSizes(canvas), 150)
  })

  return true
}

function refreshSizes(canvas) {
  initSizes(canvas)
  initBuffers()
  initPrograms(canvas)
  globalUniforms.gridSize.needsUpdate = [
    settings.grid_w,
    settings.grid_h,
    settings.dye_w,
    settings.dye_h,
    settings.dx,
    settings.rdx,
    settings.dyeRdx,
  ]
}

// Init buffer & canvas dimensions to fit the screen while keeping the aspect ratio
// and downscaling the dimensions if they exceed the browsers capabilities
function initSizes(canvas) {
  const aspectRatio = window.innerWidth / window.innerHeight
  const maxBufferSize = device.limits.maxStorageBufferBindingSize
  const maxCanvasSize = device.limits.maxTextureDimension2D

  // Fit to screen while keeping the aspect ratio
  const getPreferredDimensions = (size) => {
    let w, h
    if (window.innerHeight < window.innerWidth) {
      w = Math.floor(size * aspectRatio)
      h = size
    } else {
      w = size
      h = Math.floor(size / aspectRatio)
    }

    return getValidDimensions(w, h)
  }

  // Downscale if necessary to prevent crashes
  const getValidDimensions = (w, h) => {
    let downRatio = 1
    // Prevent buffer size overflow
    if (w * h * 4 >= maxBufferSize) downRatio = Math.sqrt(maxBufferSize / (w * h * 4))

    // Prevent canvas size overflow
    if (w > maxCanvasSize) downRatio = maxCanvasSize / w
    else if (h > maxCanvasSize) downRatio = maxCanvasSize / h

    return {
      w: Math.floor(w * downRatio),
      h: Math.floor(h * downRatio),
    }
  }

  // Calculate simulation buffer dimensions
  let gridSize = getPreferredDimensions(settings.grid_size)
  settings.grid_w = gridSize.w
  settings.grid_h = gridSize.h

  // Calculate dye & canvas buffer dimensions
  let dyeSize = getPreferredDimensions(settings.dye_size)
  settings.dye_w = dyeSize.w
  settings.dye_h = dyeSize.h

  // Useful values for the simulation
  settings.rdx = settings.grid_size * 4
  settings.dyeRdx = settings.dye_size * 4
  settings.dx = 1 / settings.rdx

  // Resize the canvas
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

function initGUI() {
  gui.add(settings, 'pressure_iterations', 0, 50).name('Pressure Iterations')

  const symmetry_types = ['none', 'horizontal', 'vertical', 'both', 'center']
  gui
    .add(settings, 'input_symmetry', symmetry_types)
    .onChange((type) => {
      let index = symmetry_types.indexOf(type)
      globalUniforms.mouse_type.setValue(index)
    })
    .name('Mouse Symmetry')

  gui.add(settings, 'reset').name('Clear canvas')

  smokeFolder = gui.addFolder('Smoke Parameters')
  smokeFolder.add(settings, 'raymarch_steps', 5, 20, 1).name('3D resolution')
  smokeFolder.add(settings, 'light_height', 0.5, 1, 0.001).name('Light Elevation')
  smokeFolder.add(settings, 'light_intensity', 0, 1, 0.001).name('Light Intensity')
  smokeFolder.add(settings, 'light_falloff', 0.5, 10, 0.001).name('Light Falloff')
  smokeFolder.add(settings, 'enable_shadows').name('Enable Shadows')
  smokeFolder.add(settings, 'shadow_intensity', 0, 50, 0.001).name('Shadow Intensity')
  smokeFolder.hide()
}

async function main(canvas: HTMLCanvasElement) {
  // Init buffers, uniforms and programs
  initBuffers()
  initUniforms(canvas)
  initPrograms(canvas)

  // Simulation reset
  function reset() {
    velocity.clear(device.queue)
    dye.clear(device.queue)
    pressure.clear(device.queue)

    settings.time = 0
  }
  settings.reset = reset

  // Fluid simulation step
  function dispatchComputePipeline(passEncoder) {
    if (settings.render_mode >= 1 && settings.render_mode <= 3) checkerProgram.dispatch(passEncoder)

    // Add velocity and dye at the mouse position
    updateDyeProgram.dispatch(passEncoder)
    updateProgram.dispatch(passEncoder)

    // Advect the velocity field through itself
    advectProgram.dispatch(passEncoder)
    boundaryProgram.dispatch(passEncoder) // boundary conditions

    // Compute the divergence
    divergenceProgram.dispatch(passEncoder)
    boundaryDivProgram.dispatch(passEncoder) // boundary conditions

    // Solve the jacobi-pressure equation
    for (let i = 0; i < settings.pressure_iterations; i++) {
      pressureProgram.dispatch(passEncoder)
      boundaryPressureProgram.dispatch(passEncoder) // boundary conditions
    }

    // Subtract the pressure from the velocity field
    gradientSubtractProgram.dispatch(passEncoder)
    clearPressureProgram.dispatch(passEncoder)

    // Compute & apply vorticity confinment
    vorticityProgram.dispatch(passEncoder)
    vorticityConfinmentProgram.dispatch(passEncoder)

    // Advect the dye through the velocity field
    advectDyeProgram.dispatch(passEncoder)
  }

  let lastFrame = performance.now()

  // Render loop
  async function step() {
    requestAnimationFrame(step)

    // Update time
    const now = performance.now()
    settings.dt = Math.min(1 / 60, (now - lastFrame) / 1000) * settings.sim_speed
    settings.time += dt
    lastFrame = now

    // Update uniforms
    Object.values(globalUniforms).forEach((u) => u.update(device.queue))

    // Update custom uniform
    if (mouseInfos.current) {
      mouseInfos.velocity = mouseInfos.last
        ? [mouseInfos.current[0] - mouseInfos.last[0], mouseInfos.current[1] - mouseInfos.last[1]]
        : [0, 0]
      mouse.update(device.queue, [...mouseInfos.current, ...mouseInfos.velocity])
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

    // Compute fluid
    const commandEncoder = device.createCommandEncoder()
    const passEncoder = commandEncoder.beginComputePass()
    dispatchComputePipeline(passEncoder)
    passEncoder.end()

    velocity0.copyTo(velocity, commandEncoder)
    pressure0.copyTo(pressure, commandEncoder)

    if (settings.render_mode == 3) velocity.copyTo(renderProgram.buffer, commandEncoder)
    else if (settings.render_mode == 4) divergence.copyTo(renderProgram.buffer, commandEncoder)
    else if (settings.render_mode == 5) pressure.copyTo(renderProgram.buffer, commandEncoder)
    else if (settings.render_mode == 6) vorticity.copyTo(renderProgram.buffer, commandEncoder)
    else dye.copyTo(renderProgram.buffer, commandEncoder)

    // Draw fluid
    renderProgram.dispatch(commandEncoder, canvas)

    // Send commands to the GPU
    const gpuCommands = commandEncoder.finish()
    device.queue.submit([gpuCommands])
  }

  initGUI()
  step()
}

export { initContext, main }
