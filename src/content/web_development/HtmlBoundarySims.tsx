import { useRef } from 'react'

import { useFluidSimEffect } from './fluid_sim/useFluidSimEffect'
import { useGpuDevice } from './useGpuDevice'

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { device, errorMessage } = useGpuDevice(canvasRef)
  useFluidSimEffect(canvasRef, device)

  return (
    <div>
      {!errorMessage && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        ></canvas>
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
