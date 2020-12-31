import React from 'react'
import P5Wrapper from './P5Wrapper'
import bubble_wrap_sketch from './sketches/bubble_wrap'

export default (
  <div>
    <h2 className="lead">
      A simple sketch with for trippy, colorful bubble patterns.
    </h2>
    <ul>
      <li>The size of the bubbles depends on X-Position of the mouse.</li>
      <li>The speed depends on Y-position of the mouse.</li>
      <li>
        Click anywhere on the screen to change the amount of rows along the
        X-axis and Y-axis.
      </li>
    </ul>
    <P5Wrapper sketch={bubble_wrap_sketch} />
  </div>
)
