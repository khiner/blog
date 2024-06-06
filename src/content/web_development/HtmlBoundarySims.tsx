import { useRef, useState, useEffect } from 'react'

import { main } from './sim/main'

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const runMain = async () => {
      if (canvasRef.current) {
        try {
          await main(canvasRef.current)
        } catch (e) {
          setErrorMessage(e.message)
        }
      }
    }

    runMain()
  }, [])

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
