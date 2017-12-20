import React, { Component } from 'react'
import P5Wrapper from './P5Wrapper'

import ShowcaseWell from '../ShowcaseWell'
import snow_globe_sketch from './sketches/snow_globe'

export default class SnowGlobe extends Component {
  render() {
    return (
      <ShowcaseWell
        title="Snow Globe"
        date="Feb 16 2015"
        wellId="snow-globe-parent"
        disqusId="SnowGlobe"
        url="https://karlhiner.com/processing/snow_globe">
        <h2 className="lead">
          Some fun with edge detection. This very simple effect, when used on
          images like cityscapes, looks like a blizzard.
          <br />
        </h2>
        <p>
          This uses the Canny edge detection method. Canny is much more verbose
          and complex than some others like the Sobel method, but has better
          results, especially on noisy images, and performs at about the same
          speed.
        </p>
        <ul>
          <li>Click on the image or use the SPACE key to start the effect.</li>
          <li>Hold down the mouse to drop snow.</li>
          <li>Use the UP and DOWN keys to make it snow more or less.</li>
          <li>
            Use the SPACE key to toggle between the original image, the "snowy"
            image and the edge detection results.
          </li>
        </ul>
        <small>
          This implementation of Canny Edge Detection is stripped down and
          adapted from Tom Gibara's implementation{' '}
          <a href="http://www.tomgibara.com/computer-vision/CannyEdgeDetector.java">
            here
          </a>.
        </small>
        <P5Wrapper sketch={snow_globe_sketch} />
      </ShowcaseWell>
    )
  }
}
