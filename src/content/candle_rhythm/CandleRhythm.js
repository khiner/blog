import React from 'react'

import Audio from '../Audio'

import candle_rhythm_audio from './assets/candle_rhythm.m4a'

// TODO:
//   - fade between the raw candle audio and a synchronized track of that audio controlling the modular

export default (
  <div>
    <h1>Candle Rhythm</h1>
    <h3>
      Using the <i>Nature's Wick Weathered Wood</i> candle as a tasty pseudo-rhythmic random audio source
    </h3>
    <Audio
      src={candle_rhythm_audio}
      alt="The sound of the Nature's Wick Weathered Wood candle, recorded with an iPhone 11"
    />
    <h3>Challenge</h3>
    <p>As a challenge to future me, or anyone out there - Learn a generative model for the candle audio</p>
    <h4>Challenge Guidelines:</h4>
    <ul>
      <li>There should be a relatively small number of model parameters</li>
      <li>
        Assume a small number of parameters mainly determine the global dynamics of the sound at any given time (e.g.
        the average temperature of the boundary between the wick and the wax, or the flammability of the wick)
      </li>
      <li>
        Assume a parallel set of rhythmic pop-generators are producing very short white noise bursts at variable
        amplitudes, each through its own IIR filter, and mixed
      </li>
      <li>Encourage the model to separately learn the room tone and natural reverb</li>
    </ul>
  </div>
)
