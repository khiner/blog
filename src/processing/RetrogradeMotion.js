import React from 'react'
import P5Wrapper from './P5Wrapper'
import retrograde_motion_sketch from './sketches/retrograde_motion'

export default (
  <div>
    <h3>
      Retrograde motion is the apparent motion of a planet to move in a
      direction opposite to that of other bodies within its system, as observed
      from a particular vantage point.
    </h3>
    <small>
      Earth's orbit speed relative to mars is slightly exaggerated to enhance
      the effect.
    </small>
    <P5Wrapper sketch={retrograde_motion_sketch} />
  </div>
)
