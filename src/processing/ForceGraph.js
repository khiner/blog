import React, { Component } from 'react';
import P5Wrapper from 'react-p5-wrapper';

import ShowcaseWell from '../ShowcaseWell'
import force_graph_sketch from './force_graph_sketch'

export default class ForceGraph extends Component {
  render() {
    return (
      <ShowcaseWell title='Force-Directed Graph' wellId='force-graph-parent' disqusId='ForceDirectedGraph' url='https://karlhiner.com/processing/bubble_wrap'>
        <P5Wrapper sketch={force_graph_sketch} />
      </ShowcaseWell>
    )
  }
}
