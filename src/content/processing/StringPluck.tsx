import P5Wrapper from './P5Wrapper'

import string_pluck_sketch from './sketches/string_pluck'

export default (
  <div>
    <h2 className="lead">Pluck the string by holding the mouse down and releasing.</h2>
    <P5Wrapper sketch={string_pluck_sketch} />
  </div>
)
