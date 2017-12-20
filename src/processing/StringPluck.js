import React, { Component } from 'react'
import P5Wrapper from './P5Wrapper'

import ShowcaseWell from '../ShowcaseWell'
import string_pluck_sketch from './sketches/string_pluck'

export default class StringPluck extends Component {
  render() {
    return (
      <ShowcaseWell
        title="String Pluck"
        date="Feb 16 2015"
        wellId="string-pluck-parent"
        disqusId="StringPluck"
        url="https://karlhiner.com/processing/string_pluck">
        <h2 className="lead">
          Pluck the string by holding the mouse down and releasing.
        </h2>
        <p>
          <a href="http://www.oberlin.edu/faculty/brichard/Apples/StringsPage.html">
            The equation for this simulation
          </a>
        </p>
        <P5Wrapper sketch={string_pluck_sketch} />
      </ShowcaseWell>
    )
  }
}
