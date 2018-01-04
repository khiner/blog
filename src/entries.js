import React from 'react'

import config from './config'

import CalahjesAndLewps from './albums/CalahjesAndLewps'
import MakeNoiseSharedSystemJams from './albums/MakeNoiseSharedSystemJams'
import MidiMarkovCompose from './albums/MidiMarkovCompose'
import MidiMarkovDecompose from './albums/MidiMarkovDecompose'
import WebTracks2006To2011 from './albums/WebTracks2006To2011'
import WebTracks2012To2017 from './albums/WebTracks2012To2017'

import PythonCrashCourse from './jupyter_notebooks/PythonCrashCourse'
import DftTimeseries from './jupyter_notebooks/DftTimeseries'

import AutoSampler from './music_generation/AutoSampler'
import MidiMarkov from './music_generation/MidiMarkov'

import RetrogradeMotion from './processing/RetrogradeMotion'
import BubbleWrap from './processing/BubbleWrap'
import ForceGraph from './processing/ForceGraph'
import SnowGlobe from './processing/SnowGlobe'
import StringPluck from './processing/StringPluck'

import kaoss_pad_mini_image from './albums/assets/kaoss_pad_mini.jpg'
import make_noise_shared_system_image from './albums/assets/makenoise_shared_system.jpg'
import pluck_equation_image from './processing/assets/pluck_equation.jpg'
import snow_globe_image from './processing/assets/snow_globe.png'
import apparent_retrograde_motion_image from './processing/assets/apparent_retrograde_motion.png'
import mario_warped_image from './processing/assets/mario_warped.png'
import bubble_wrap_preview_image from './processing/assets/bubble_wrap_preview.png'
import beethovens_5th_image from './music_generation/assets/beethovens_5th.png'
import python_crash_course_preview_image from './jupyter_notebooks/assets/python_crash_course_preview.png'
import windowing_animation from './jupyter_notebooks/assets/windowing_animation.gif'

import { stripSlashes } from './utils'

const entries = [
  {
    path: '/albums/web_tracks_2006_2011',
    summaryTitle: 'Album - Web Tracks 2006 - 2011',
    title: 'Web Tracks 2006 - 2011',
    date: 'May 30 2011',
    disqusId: 'WebTracks2006-2011',
    description:
      'A bunch of random tracks ranging from about 2006-2011. Playful bedroom experiments. Some are just goofy, some are more serious. Some good ideas, some not so much. All of them mastered terribly.',
    content: WebTracks2006To2011,
    type: 'article',
  },
  {
    path: '/albums/calahjes_and_lewps',
    summaryTitle: 'Album - Calahjes&Lewps',
    title: 'Calahjes&Lewps',
    date: 'Dec 22 2011',
    disqusId: 'CalahjesAndLewps',
    description: (
      <div>
        <p>Stream of consciousness frenetic sampling from musical sources.</p>
        <img
          src={kaoss_pad_mini_image}
          alt="Kaoss Pad Mini"
          style={{ width: '30%' }}
        />
      </div>
    ),
    content: CalahjesAndLewps,
    type: 'article',
  },
  {
    path: '/albums/make_noise_shared_system_jams',
    summaryTitle: 'Album - Make Noise Shared System Jams',
    title: 'Make Noise Shared System Jams',
    date: 'Jan 27 2016',
    disqusId: 'MakeNoiseSharedSystemJams',
    description: (
      <div>
        <p>
          Modular synth patches, made mostly using the Make Noise Shared
          System.'
        </p>
        <img
          src={make_noise_shared_system_image}
          alt="Make Noise Shared System"
        />
      </div>
    ),
    content: MakeNoiseSharedSystemJams,
    type: 'article',
  },
  {
    path: '/albums/midi_markov_compose',
    summaryTitle: 'Album - MIDI Markov: Compose',
    title: 'MIDI Markov: Compose',
    date: 'Sep 1 2016',
    disqusId: 'MidiMarkovCompose',
    description:
      'Piano compositions generated from a Markov chain given classical MIDI scores as input.',
    content: MidiMarkovCompose,
    type: 'article',
  },
  {
    path: '/albums/midi_markov_decompose',
    summaryTitle: 'Album - MIDI Markov: Decompose',
    title: 'MIDI Markov: Decompose',
    date: 'Sep 2 2016',
    disqusId: 'MidiMarkovDecompose',
    description:
      'Piano compositions generated from a Markov chain given classical MIDI scores as input.  Unlike the "MIDI Markov: Compose" album, these pieces introduce intentional MIDI errors to generate more experimental, ambient pieces.',
    content: MidiMarkovDecompose,
    type: 'article',
  },
  {
    path: '/albums/web_tracks_2012_2017',
    summaryTitle: 'Album - Web Tracks 2012-2017',
    title: 'Web Tracks 2012-2017',
    date: 'Nov 1 2017',
    disqusId: 'WebTracks2012-2017',
    description:
      "A collection of tracks I published spanning from 2012 to 2017. There isn't any cohesive theme. Special guests Andrew Knight (on Riders of the Night - the Raccoon Song) and pLiskin (on Elise and Paw).",
    content: WebTracks2012To2017,
    type: 'article',
  },
  {
    path: '/processing/string_pluck',
    summaryTitle: 'Processing Sketch - String Pluck',
    title: 'String Pluck',
    date: 'Feb 16 2015',
    disqusId: 'StringPluck',
    description: (
      <div>
        <p>Pluck a string by holding the mouse down, dragging and releasing.</p>
        <img src={pluck_equation_image} alt="Equation for plucked string" />
      </div>
    ),
    content: StringPluck,
    type: 'showcase',
  },
  {
    path: '/processing/snow_globe',
    summaryTitle: 'Processing Sketch - Snow Globe',
    title: 'Snow Globe',
    date: 'Feb 16 2015',
    disqusId: 'SnowGlobe',
    description: (
      <div>
        <p>
          Some fun with edge detection. This simple effect, when used on images
          like cityscapes, looks like a blizzard.
        </p>
        <img src={snow_globe_image} alt="Preview of Snow Globe sketch" />
      </div>
    ),
    content: SnowGlobe,
    type: 'showcase',
  },
  {
    path: '/processing/retrograde_motion',
    summaryTitle: 'Processing Sketch - Apparent Retrograde Motion',
    title: 'Apparent Retrograde Motion',
    date: 'Feb 15 2016',
    disqusId: 'ApparentRetrogradeMotion',
    description: (
      <div>
        <p>
          Retrograde motion is the apparent motion of a planet to move in a
          direction opposite to that of other bodies within its system, as
          observed from a particular vantage point.
        </p>
        <img
          src={apparent_retrograde_motion_image}
          alt="Preview of Retrograde Motion sketch"
        />
      </div>
    ),
    content: RetrogradeMotion,
    type: 'showcase',
  },
  {
    path: '/processing/force_graph',
    summaryTitle: 'Processing Sketch - Force-Directed Graph',
    title: 'Force-Directed Graph',
    date: 'July 31 2016',
    disqusId: 'ForceDirectedGraph',
    description: (
      <div>
        <p>
          Mapping a force-directed graph to an image for stretching and warping.
        </p>
        <img
          src={mario_warped_image}
          alt="Mario warped with force-directed graph"
          style={{ width: '40%' }}
        />
      </div>
    ),
    content: ForceGraph,
    type: 'showcase',
  },
  {
    path: '/music_generation/midi_markov',
    title: 'Generating MIDI with Markov Chains',
    date: 'Aug 28 2016',
    disqusId: 'MidiMarkov',
    description: (
      <div>
        <p>
          MidiMarkov is a command-line tool that uses a Markov process to
          generate MIDI streams based on a floder of MIDI source material.
        </p>
        <img
          src={beethovens_5th_image}
          alt="Section of Beethoven's 5th symphony melody"
        />
      </div>
    ),
    content: MidiMarkov,
    type: 'article',
  },
  {
    path: '/music_generation/auto_sampler',
    title: 'AutoSampler for Max4Live',
    date: 'Sep 8 2016',
    disqusId: 'AutoSampler',
    description: (
      <div>
        <p>
          AutoSampler is an intelligent Max4Live instrument that plays audio
          segments found in your library matching the notes of incoming live
          MIDI.
        </p>
        <div className="videoWrapper">
          <iframe
            title="AutoSampler Demo"
            src="https://www.youtube.com/embed/IgO__9XJ2Cg?wmode=opaque&amp;enablejsapi=1"
            scrolling="no"
            frameBorder="0"
          />
        </div>
      </div>
    ),
    content: AutoSampler,
    type: 'article',
  },
  {
    path: '/processing/bubble_wrap',
    summaryTitle: 'Processing Sketch - Bubble Wrap',
    title: 'Bubble Wrap',
    date: 'Dec 19 2017',
    disqusId: 'BubbleWrap',
    description: (
      <div>
        <p>A simple sketch with for trippy, colorful bubble patterns.</p>
        <img
          src={bubble_wrap_preview_image}
          alt="Preview of Bubble Wrap sketch"
        />
      </div>
    ),
    content: BubbleWrap,
    type: 'showcase',
  },
  {
    path: '/jupyter_notebooks/python_crash_course',
    summaryTitle: 'Jupyter Notebook - Python Crash Course',
    title: 'Python Crash Course',
    date: 'Dec 20 2017',
    disqusId: 'JupyterPythonCrashCourse',
    description: (
      <div>
        <p>
          This Jupyter Notebook contains all code, excercises and projects from
          the Python Crash Course book by Eric Matthes, including three
          projects: a "Space Invaders"-style game developed with PyGame, a data
          visualization project and a Django app.
        </p>
        <img
          src={python_crash_course_preview_image}
          alt="Preview of random walk chart from Python Crash Course book"
          style={{ width: '80%' }}
        />
      </div>
    ),
    content: PythonCrashCourse,
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/dft_timeseries',
    summaryTitle: 'Jupyter Notebook - DFT for timeseries data',
    title: 'DFT for timeseries data',
    date: 'Jan 3 2018',
    disqusId: 'JupyterDftTimeseries',
    description: (
      <div>
        <p>
          I developed this Jupyter Notebook for a presentation on applying the
          DFT to timeseries data for seasonality detection.
        </p>
        <img
          src={windowing_animation}
          alt="Animation of windowing's affect on the DFT with pure sinusoids"
        />
      </div>
    ),
    content: DftTimeseries,
    type: 'article',
  },
]

entries.forEach(entry => {
  entry.url = `${stripSlashes(config.host)}/${stripSlashes(entry.path)}`
})

export default entries
