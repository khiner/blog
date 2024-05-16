import React, { useEffect, useRef } from 'react'
import p5 from 'p5'

export default ({ sketch }) => {
  const wrapperRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    canvasRef.current = new p5(sketch, wrapperRef.current)
    canvasRef.current?.myCustomRedrawAccordingToNewPropsHandler?.({ sketch })
    return () => {
      canvasRef.current?.remove()
    }
  }, [sketch])

  return <div ref={wrapperRef} />
}
