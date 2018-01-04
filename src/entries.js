import config from './config'

import RetrogradeMotion from './processing/RetrogradeMotion'
import BubbleWrap from './processing/BubbleWrap'
import ForceGraph from './processing/ForceGraph'
import SnowGlobe from './processing/SnowGlobe'
import StringPluck from './processing/StringPluck'

import AutoSampler from './music_generation/AutoSampler'
import MidiMarkov from './music_generation/MidiMarkov'

import PythonCrashCourse from './jupyter_notebooks/PythonCrashCourse'
import DftTimeseries from './jupyter_notebooks/DftTimeseries'

import { stripSlashes } from './utils'

const entries = [
  {
    path: '/processing/string_pluck',
    title: 'String Pluck',
    date: 'Feb 16 2015',
    disqusId: 'StringPluck',
    description:
      'Pluck the string by holding the mouse down, dragging and releasing.',
    content: StringPluck,
    type: 'showcase',
  },
  {
    path: '/processing/snow_globe',
    title: 'Snow Globe',
    date: 'Feb 16 2015',
    disqusId: 'SnowGlobe',
    description:
      'Some fun with edge detection. This simple effect, when used on images like cityscapes, looks like a blizzard.',
    content: SnowGlobe,
    type: 'showcase',
  },
  {
    path: '/processing/retrograde_motion',
    title: 'Apparent Retrograde Motion',
    date: 'Feb 15 2016',
    disqusId: 'ApparentRetrogradeMotion',
    description:
      'Retrograde motion is the apparent motion of a planet to move in a direction opposite to that of other bodies within its system, as observed from a particular vantage point.',
    content: RetrogradeMotion,
    type: 'showcase',
  },
  {
    path: '/processing/force_graph',
    title: 'Force-Directed Graph',
    date: 'July 31 2016',
    disqusId: 'ForceDirectedGraph',
    description:
      'Mapping a force-directed graph to an image for stretching and warping.',
    content: ForceGraph,
    type: 'showcase',
  },
  {
    path: '/music_generation/midi_markov',
    title: 'Generating MIDI with Markov Chains',
    date: 'Aug 28 2016',
    disqusId: 'MidiMarkov',
    description:
      'MidiMarkov is a command-line tool that uses a Markov process to generate MIDI streams based on a floder of MIDI source material',
    content: MidiMarkov,
    type: 'article',
  },
  {
    path: '/music_generation/auto_sampler',
    title: 'AutoSampler for Max4Live',
    date: 'Sep 8 2016',
    disqusId: 'AutoSampler',
    description:
      'AutoSampler is an intelligent Max4Live instrument that plays audio segments found in your library based on live MIDI.',
    content: AutoSampler,
    type: 'article',
  },
  {
    path: '/processing/bubble_wrap',
    title: 'Bubble Wrap',
    date: 'Dec 19 2017',
    disqusId: 'BubbleWrap',
    description: 'A simple sketch with for trippy, colorful bubble patterns.',
    content: BubbleWrap,
    type: 'showcase',
  },
  {
    path: '/jupyter_notebooks/python_crash_course',
    title: 'Python Crash Course',
    date: 'Dec 20 2017',
    description:
      'This Jupyter Notebook contains all code, excercises and projects from the Python Crash Course book by Eric Matthes, including three projects: a "Space Invaders"-style game developed with PyGame, a data visualization project and a Django app.',
    content: PythonCrashCourse,
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/dft_timeseries',
    title: 'DFT for timeseries data',
    date: 'Jan 3 2018',
    description:
      'This is a Jupyter Notebook I developed for a presentation on applying the DFT to timeseries data for seasonality detection.',
    content: DftTimeseries,
    type: 'article',
  },
]

entries.forEach(
  entry =>
    (entry.url = `${stripSlashes(config.host)}/${stripSlashes(entry.path)}`)
)

export default entries
