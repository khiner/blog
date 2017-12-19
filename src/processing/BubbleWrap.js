import React, { Component } from 'react';
import P5Wrapper from './P5Wrapper';

import ShowcaseWell from '../ShowcaseWell'
import bubble_wrap_sketch from './bubble_wrap_sketch'

export default class BubbleWrap extends Component {
  render() {
    return (
      <ShowcaseWell title='Bubble Wrap' wellId='bubble-wrap-parent' disqusId='BubbleWrap' url='https://karlhiner.com/processing/bubble_wrap'>
        <h2 className='lead'>A simple sketch with for trippy, colorful bubble patterns.</h2>
        <ul>
          <li>Click on the image or use the SPACE key to start the effect.</li>
          <li>The size of the bubbles depends on X-Position of the mouse.</li>
          <li>The speed depends on Y-position of the mouse.</li>
          <li>Click anywhere on the screen to change the amount of rows along the X-axis and Y-axis.</li>
        </ul>
        <P5Wrapper sketch={bubble_wrap_sketch} />
      </ShowcaseWell>
    )
  }
}
