import { useState, useEffect, RefObject } from 'react'

export const useGpuDevice = (canvasRef: RefObject<HTMLCanvasElement>) => {
  const [device, setDevice] = useState<GPUDevice | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const initializeGpu = async () => {
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

    initializeGpu()
  }, [canvasRef])

  return { device, errorMessage }
}
