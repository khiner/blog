import React, { Component } from 'react'
import P5Wrapper from './P5Wrapper'

import ShowcaseWell from '../ShowcaseWell'
import retrograde_motion_sketch from './sketches/retrograde_motion'

export default class RetrogradeMotion extends Component {
  render() {
    return (
      <ShowcaseWell
        title="Apparent Retrograde Motion"
        wellId="retrograde-motion-parent"
        disqusId="ApparentRetrogradeMotion"
        url="https://karlhiner.com/processing/retrograde_motion">
        <h3>
          Retrograde motion is the apparent motion of a planet to move in a
          direction opposite to that of other bodies within its system, as
          observed from a particular vantage point.
        </h3>
        <small>
          Earth's orbit speed relative to mars is slightly exaggerated to
          enhance the effect
        </small>
        <P5Wrapper sketch={retrograde_motion_sketch} />
      </ShowcaseWell>
    )
  }
}
