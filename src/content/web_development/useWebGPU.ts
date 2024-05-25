import { useEffect, useRef } from 'react'
import * as _webgpu from '@webgpu/types'

const smokeVertexShaderCode = `
struct VertexOutput {
  @builtin(position) position : vec4<f32>,
  @location(0) vUV : vec2<f32>,
};

@vertex
fn main(@builtin(vertex_index) vertexIndex : u32) -> VertexOutput {
  var positions = array<vec2<f32>, 6>(
      vec2<f32>(-1, -1),
      vec2<f32>(1, -1),
      vec2<f32>(-1, 1),
      vec2<f32>(-1, 1),
      vec2<f32>(1, -1),
      vec2<f32>(1, 1)
  );

  var output : VertexOutput;
  output.position = vec4<f32>(positions[vertexIndex], 0, 1);
  output.vUV = positions[vertexIndex] * 0.5 + vec2<f32>(0.5, 0.5);
  return output;
}`

const smokeFragmentShaderCode = `
struct Uniforms {
  time: f32,
};
      
@group(0) @binding(0) var<uniform> uniforms : Uniforms;
      
fn hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453123);
}

fn noise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let a = hash(i);
  let b = hash(i + vec2<f32>(1, 0));
  let c = hash(i + vec2<f32>(0, 1));
  let d = hash(i + vec2<f32>(1, 1));
  let u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
      
@fragment
fn main(@location(0) vUV : vec2<f32>) -> @location(0) vec4<f32> {
  let uv = vUV * 2.0 - vec2<f32>(1, 1);
  let c = vec3<f32>(0.388, 0.722, 1.0);
  let n = noise(uv * 3.0 + uniforms.time);
  return vec4<f32>(mix(c, vec3<f32>(1, 1, 1), n), 1.0);
}`

const boundaryVertexShaderCode = `
struct VertexInput {
  @location(0) position : vec2<f32>,
};

struct VertexOutput {
  @builtin(position) position : vec4<f32>,
};

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4<f32>(input.position, 0.0, 1.0);
  return output;
}`

const boundaryFragmentShaderCode = `
@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}`

const setCanvasResolution = (canvas) => {
  const ratio = window.devicePixelRatio || 1
  canvas.width = canvas.clientWidth * ratio
  canvas.height = canvas.clientHeight * ratio
  canvas.style.width = `${canvas.clientWidth}px`
  canvas.style.height = `${canvas.clientHeight}px`
}

const useWebGPU = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const deviceRef = useRef<GPUDevice | null>(null)
  const boundaryBufferRef = useRef<GPUBuffer | null>(null)

  useEffect(() => {
    const initWebGPU = async () => {
      if (!canvasRef.current) return

      setCanvasResolution(canvasRef.current)

      const adapter = await navigator.gpu.requestAdapter()
      const device = await adapter.requestDevice()
      const context = canvasRef.current.getContext('webgpu')
      const format = navigator.gpu.getPreferredCanvasFormat()
      context.configure({
        device,
        format,
        alphaMode: 'premultiplied',
      })

      deviceRef.current = device

      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: device.createShaderModule({ code: smokeVertexShaderCode }),
          entryPoint: 'main',
        },
        fragment: {
          module: device.createShaderModule({ code: smokeFragmentShaderCode }),
          entryPoint: 'main',
          targets: [{ format }],
        },
        primitive: {
          topology: 'triangle-list',
        },
      })

      const boundaryPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: device.createShaderModule({ code: boundaryVertexShaderCode }),
          entryPoint: 'main',
          buffers: [
            {
              arrayStride: 2 * 4, // 2 floats per vertex
              attributes: [
                {
                  shaderLocation: 0,
                  offset: 0,
                  format: 'float32x2' as GPUVertexFormat,
                },
              ],
            },
          ],
        },
        fragment: {
          module: device.createShaderModule({ code: boundaryFragmentShaderCode }),
          entryPoint: 'main',
          targets: [{ format }],
        },
        primitive: {
          topology: 'line-strip',
        },
      })

      const uniformBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      const uniformBindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer,
            },
          },
        ],
      })

      const updateBoundaryBuffer = () => {
        const element = document.querySelector('.boundary')
        if (!element) return

        const r = element.getBoundingClientRect()
        const cr = canvasRef.current.getBoundingClientRect()
        const left = ((r.left - cr.left) / cr.width) * 2 - 1
        const right = ((r.right - cr.left) / cr.width) * 2 - 1
        const top = ((r.top - cr.top) / cr.height) * -2 + 1
        const bottom = ((r.bottom - cr.top) / cr.height) * -2 + 1
        const boundaries = [left, top, right, top, right, bottom, left, bottom, left, top]

        boundaryBufferRef.current?.destroy()
        boundaryBufferRef.current = device.createBuffer({
          size: boundaries.length * 4,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          mappedAtCreation: true,
        })

        new Float32Array(boundaryBufferRef.current.getMappedRange()).set(boundaries)
        boundaryBufferRef.current.unmap()
      }

      const startTime = Date.now()

      const renderLoop = () => {
        device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([(Date.now() - startTime) / 1000]))

        const texture = context.getCurrentTexture()
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: texture.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear' as GPULoadOp,
              storeOp: 'store' as GPUStoreOp,
            },
          ],
        }

        const commandEncoder = device.createCommandEncoder()
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
        passEncoder.setPipeline(pipeline)
        passEncoder.setBindGroup(0, uniformBindGroup)
        passEncoder.draw(6, 1, 0, 0)

        if (boundaryBufferRef.current) {
          passEncoder.setPipeline(boundaryPipeline)
          passEncoder.setVertexBuffer(0, boundaryBufferRef.current)
          passEncoder.draw(boundaryBufferRef.current.size / (2 * 4)) // 2 floats per vertex, 4 bytes per float
        }

        passEncoder.end()
        device.queue.submit([commandEncoder.finish()])

        updateBoundaryBuffer()
        requestAnimationFrame(renderLoop)
      }

      requestAnimationFrame(renderLoop)
    }

    initWebGPU()

    return () => {
      deviceRef.current?.destroy()
      deviceRef.current = null
    }
  }, [canvasRef])

  return null
}

export default useWebGPU
