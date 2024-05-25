import { useRef, useState } from 'react'

import useWebGPU from './useWebGPU'

import 'style/App.scss'

export default () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWebGPU(canvasRef)

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      ></canvas>

      <div className="boundary" style={{ width: '75%', height: 'auto', textAlign: 'center' }}>
        Boundary
      </div>
    </div>
  )
}
