import React, { useEffect, useRef } from 'react'
import p5 from 'p5'

export default ({ sketch }) => {
  const wrapperRef = useRef(null)

  useEffect(() => {
    const canvas = new p5(sketch, wrapperRef.current)
    return () => {
      canvas.remove()
    }
  }, [sketch])

  return <div ref={wrapperRef} />
}
