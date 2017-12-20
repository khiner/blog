import React from 'react'

import RetrogradeMotion from './processing/RetrogradeMotion'
import BubbleWrap from './processing/BubbleWrap'
import ForceGraph from './processing/ForceGraph'
import SnowGlobe from './processing/SnowGlobe'
import StringPluck from './processing/StringPluck'

import AutoSampler from './music_generation/AutoSampler'
import MidiMarkov from './music_generation/MidiMarkov'

import JupyterNotebooks from './jupyter_notebooks/JupyterNotebooks'

import { stripSlashes } from './utils'

const HOST = 'https://karlhiner.com'
const entries = [
  {
    path: '/processing/retrograde_motion',
    title: 'Apparent Retrograde Motion',
    date: 'Feb 15 2016',
    disqusId: 'ApparentRetrogradeMotion',
    wellId: 'retrograde-motion-parent',
    description:
      'Retrograde motion is the apparent motion of a planet to move in a direction opposite to that of other bodies within its system, as observed from a particular vantage point.',
    content: RetrogradeMotion,
    type: 'showcase',
  },
  {
    path: '/processing/bubble_wrap',
    title: 'Bubble Wrap',
    date: 'Dec 19 2017',
    disqusId: 'BubbleWrap',
    wellId: 'bubble-wrap-parent',
    description: 'A simple sketch with for trippy, colorful bubble patterns.',
    content: BubbleWrap,
    type: 'showcase',
  },
  {
    path: '/processing/force_graph',
    title: 'Force-Directed Graph',
    date: 'July 31 2016',
    disqusId: 'ForceDirectedGraph',
    wellId: 'force-graph-parent',
    description:
      'Mapping a force-directed graph to an image for stretching and warping.',
    content: ForceGraph,
    type: 'showcase',
  },
  {
    path: '/processing/snow_globe',
    title: 'Snow Globe',
    date: 'Feb 16 2015',
    disqusId: 'SnowGlobe',
    wellId: 'snow-globe-parent',
    description:
      'Some fun with edge detection. This simple effect, when used on images like cityscapes, looks like a blizzard.',
    content: SnowGlobe,
    type: 'showcase',
  },
  {
    path: '/processing/string_pluck',
    title: 'String Pluck',
    date: 'Feb 16 2015',
    disqusId: 'SnowGlobe',
    wellId: 'string-pluck-parent',
    description:
      'Pluck the string by holding the mouse down, dragging and releasing.',
    content: StringPluck,
    type: 'showcase',
  },
  {
    path: '/music_generation/auto_sampler',
    title: 'AutoSampler for Max4Live',
    date: 'Sep 8 2016',
    disqusId: 'AutoSampler',
    description: (
      <p>
        <a href="https://github.com/khiner/AutoSampler">AutoSampler</a> is an
        intelligent Max4Live instrument that plays audio segments found in your
        library based on live MIDI.
      </p>
    ),
    content: AutoSampler,
    type: 'article',
  },
  {
    path: '/music_generation/midi_markov',
    title: 'Generating MIDI with Markov chains',
    date: 'Aug 28 2016',
    disqusId: 'MidiMarkov',
    description: (
      <p>
        <a href="https://github.com/khiner/midi_markov">Midi Markov</a> is a
        command-line tool that uses a Markov process to generate MIDI streams
        based on a floder of MIDI source material.
      </p>
    ),
    content: MidiMarkov,
    type: 'article',
  },
  {
    path: '/jupyter_notebooks',
    title: 'Jupyter Notebooks',
    content: JupyterNotebooks,
    type: 'article',
    excludeFromFrontPage: true,
  },
]

entries.forEach(entry => (entry.url = HOST + `/${stripSlashes(entry.path)}`))

export default entries
