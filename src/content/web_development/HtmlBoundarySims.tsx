import { useRef, useEffect } from 'react'

import { main } from './sim/main'

export default () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    // todo catch error
    if (canvasRef.current) main(canvasRef.current)
  }, [])

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      ></canvas>
      {/* <div className="webgpu-not-supported">
        <p>
          WebGPU doesn't appear to be enabled / supported on this browser. <br />
          Check if your browser has any update available!
        </p>
        <a href="https://developer.chrome.com/en/docs/web-platform/webgpu/#use">
          https://developer.chrome.com/en/docs/web-platform/webgpu/#use
        </a>
      </div> */}
    </div>
  )
}
