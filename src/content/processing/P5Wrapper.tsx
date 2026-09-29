import { useEffect, useRef } from 'preact/compat'
import p5 from 'p5/core'
import shape from 'p5/shape'
import accessibility from 'p5/accessibility'
import color from 'p5/color'
import dom from 'p5/dom'
import events from 'p5/events'
import image from 'p5/image'
import math from 'p5/math'
import utilities from 'p5/utilities'
import type from 'p5/type'

for (const addon of [shape, accessibility, color, dom, events, image, math, utilities, type]) addon(p5)

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
