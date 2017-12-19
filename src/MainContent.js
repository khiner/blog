import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import RetrogradeMotion from './processing/RetrogradeMotion'
import StringPluck from './processing/StringPluck'
import SnowGlobe from './processing/SnowGlobe'
import ForceGraph from './processing/ForceGraph'
import BubbleWrap from './processing/BubbleWrap'

import AutoSampler from './music_generation/AutoSampler'
import MidiMarkov from './music_generation/MidiMarkov'

import JupyterNotebooks from './audio_dsp/JupyterNotebooks'

class MainContent extends Component {
  render() {
    return (
      <div>
        <Route
          path="/processing/retrograde_motion"
          component={RetrogradeMotion}
        />
        <Route path="/processing/string_pluck" component={StringPluck} />
        <Route path="/processing/snow_globe" component={SnowGlobe} />
        <Route path="/processing/force_graph" component={ForceGraph} />
        <Route path="/processing/bubble_wrap" component={BubbleWrap} />

        <Route path="/music_generation/auto_sampler" component={AutoSampler} />
        <Route path="/music_generation/midi_markov" component={MidiMarkov} />

        <Route
          path="/audio_dsp/jupyter_notebooks"
          component={JupyterNotebooks}
        />
      </div>
    )
  }
}

export default MainContent
