import React from 'react'
import P5Wrapper from './P5Wrapper'

import string_pluck_sketch from './sketches/string_pluck'

export default (
  <div>
    <h2 className="lead">Pluck the string by holding the mouse down and releasing.</h2>
    <p>
      <a href="http://www.oberlin.edu/faculty/brichard/Apples/StringsPage.html">The equation for this simulation</a>
    </p>
    <P5Wrapper sketch={string_pluck_sketch} />
  </div>
)
