import React from 'react'

import AlbumPreview from './content/albums/AlbumPreview'

import make_noise_shared_system_image from './content/albums/assets/makenoise_shared_system.jpg'
import pluck_equation_image from './content/processing/assets/pluck_equation.jpg'
import snow_globe_image from './content/processing/assets/snow_globe.png'
import apparent_retrograde_motion_image from './content/processing/assets/apparent_retrograde_motion.png'
import mario_warped_image from './content/processing/assets/mario_warped.png'
import bubble_wrap_preview_image from './content/processing/assets/bubble_wrap_preview.png'
import beethovens_5th_image from './content/music_generation/assets/beethovens_5th.png'

import accelerated_cpp_preview_image from './content/jupyter_notebooks/assets/accelerated_cpp_preview.png'
import coding_the_matrix_preview_image from './content/jupyter_notebooks/assets/coding_the_matrix/coding_the_matrix_preview.png'
import musimathics_volume_1_preview_image from './content/jupyter_notebooks/assets/musimathics/musimathics_volume_1_preview.gif'
import musimathics_volume_2_preview_image from './content/jupyter_notebooks/assets/musimathics/musimathics_volume_2_preview.gif'
import python_crash_course_preview_image from './content/jupyter_notebooks/assets/python_crash_course_preview.png'
import python_for_data_analysis_preview_image from './content/jupyter_notebooks/assets/python_for_data_analysis_preview.png'
import windowing_animation from './content/jupyter_notebooks/assets/windowing_animation.gif'

import site_generator_demo from './content/web_development/assets/site_generator_demo.gif'

// See https://github.com/khiner/react-scripts-bootstrap-site-generator/blob/master/template/src/entries.js
// for documentation on entries
const entries = [
  {
    path: '/albums/web_tracks_2006_2011',
    summaryTitle: 'Album - Web Tracks 2006 - 2011',
    title: 'Web Tracks 2006 - 2011',
    date: 'May 30 2011',
    disqusId: 'WebTracks2006-2011',
    description: (
      <div>
        <p>
          A bunch of random tracks ranging from about 2006-2011. Playful bedroom
          experiments. Some are just goofy, some are more serious. Some good
          ideas, some not so much. All of them mastered terribly.
        </p>
        <AlbumPreview title="Web Tracks 2006 - 2011" playlistId="3066212" />
      </div>
    ),
    descriptionPlainText:
      'A bunch of random tracks ranging from about 2006-2011. Playful bedroom experiments. Some are just goofy, some are more serious. Some good ideas, some not so much. All of them mastered terribly.',
    contentPath: 'albums/WebTracks2006To2011',
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
        <AlbumPreview title="Calahjes & Lewps" playlistId="1425406" />
      </div>
    ),
    descriptionPlainText:
      'An album of stream of consciousness frenetic sampling from musical sources.',
    contentPath: 'albums/CalahjesAndLewps',
    type: 'article',
  },
  {
    path: '/albums/make_noise_shared_system_jams',
    summaryTitle: 'Album - MakeNoise Shared System Jams',
    title: 'MakeNoise Shared System Jams',
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
        <AlbumPreview
          title="MakeNoise Shared System Jams"
          playlistId="63454085"
        />
      </div>
    ),
    descriptionPlainText:
      'Eight Modular synth patches, made mostly using the Make Noise Shareed System.',
    contentPath: 'albums/MakeNoiseSharedSystemJams',
    type: 'article',
  },
  {
    path: '/albums/midi_markov_compose',
    summaryTitle: 'Album - MIDI Markov: Compose',
    title: 'MIDI Markov: Compose',
    date: 'Sep 1 2016',
    disqusId: 'MidiMarkovCompose',
    description: (
      <div>
        <p>
          Piano compositions generated from a Markov chain given classical MIDI
          scores as input.
        </p>
        <AlbumPreview title="MidiMarkov: Compose" playlistId="257076049" />
      </div>
    ),
    descriptionPlainText:
      'Piano compositions generated from a Markov chain given classical MIDI scores as input.',
    contentPath: 'albums/MidiMarkovCompose',
    type: 'article',
  },
  {
    path: '/albums/midi_markov_decompose',
    summaryTitle: 'Album - MIDI Markov: Decompose',
    title: 'MIDI Markov: Decompose',
    date: 'Sep 2 2016',
    disqusId: 'MidiMarkovDecompose',
    description: (
      <div>
        <p>
          Piano compositions generated from a Markov chain given classical MIDI
          scores as input. Unlike the "MIDI Markov: Compose" album, these pieces
          introduce intentional MIDI errors to generate more experimental,
          ambient pieces.
        </p>
        <AlbumPreview title="MidiMarkov: Decompose" playlistId="257110789" />
      </div>
    ),
    descriptionPlainText:
      'Piano compositions generated from a Markov chain given classical MIDI scores as input.  Unlike the "MIDI Markov: Compose" album, these pieces introduce intentional MIDI errors to generate more experimental, ambient pieces.',
    contentPath: 'albums/MidiMarkovDecompose',
    type: 'article',
  },
  {
    path: '/albums/web_tracks_2012_2017',
    summaryTitle: 'Album - Web Tracks 2012-2017',
    title: 'Web Tracks 2012-2017',
    date: 'Nov 1 2017',
    disqusId: 'WebTracks2012-2017',
    description: (
      <div>
        <p>
          A collection of tracks I published spanning from 2012 to 2017. There
          isn't any cohesive theme. Special guests Andrew Knight (on Riders of
          the Night - the Raccoon Song) and pLiskin (on Elise and Paw).
        </p>
        <AlbumPreview title="Web Tracks 2012 - 2017" playlistId="5017148" />
      </div>
    ),
    descriptionPlainText:
      "A collection of tracks I published spanning from 2012 to 2017. There isn't any cohesive theme. Special guests Andrew Knight (on Riders of the Night - the Raccoon Song) and pLiskin (on Elise and Paw).",
    contentPath: 'albums/WebTracks2012To2017',
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
        <p>Interactive model of plucked string motion.</p>
        <img src={pluck_equation_image} alt="Equation for plucked string" />
      </div>
    ),
    descriptionPlainText:
      'A Processing sketch modeling a plucked string by holding the mouse down, draggind and releasing.',
    contentPath: 'processing/StringPluck',
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
    descriptionPlainText:
      'A Processing sketch using edge detection to drop a snowstorm on images.',
    contentPath: 'processing/SnowGlobe',
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
    descriptionPlainText:
      'A Processing sketch showing the effect of retrograde motion - the apparent motion of a planet to move in a direction opposite to that the observing planet.',
    contentPath: 'processing/RetrogradeMotion',
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
          Mapping a force-directed graph to an image for bouncy stretching and
          warping.
        </p>
        <img
          src={mario_warped_image}
          alt="Mario warped with force-directed graph"
          style={{ width: '40%' }}
        />
      </div>
    ),
    descriptionPlainText:
      'A Processing sketch that maps a force-directed graph to an image for bouncy stretching and warping.',
    contentPath: 'processing/ForceGraph',
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
          generate MIDI streams based on a given folder of MIDI source material.
        </p>
        <img
          src={beethovens_5th_image}
          alt="Section of Beethoven's 5th symphony melody"
        />
      </div>
    ),
    descriptionPlainText:
      'MidiMarkov is a command-line tool that uses a Markov process to generate MIDI streams based on a given folder of MIDI source material',
    contentPath: 'music_generation/MidiMarkov',
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
    descriptionPlainText:
      'AutoSampler is an intelligent Max4Live instrument that plays audio segments found in your library matching the notes of incoming live MIDI.',
    contentPath: 'music_generation/AutoSampler',
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
    descriptionPlainText:
      'A simple Processing sketch with for trippy, colorful bubble patterns.',
    contentPath: 'processing/BubbleWrap',
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
          the "Python Crash Course" book by Eric Matthes, including three
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
    descriptionPlainText:
      'This Jupyter Notebook contains all code, excercises and projects from the Python Crash Course book by Eric Matthes, including three projects: a "Space Invaders"-style game developed with PyGame, a data visualization project and a Django app.',
    contentPath: 'jupyter_notebooks/PythonCrashCourse',
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
    descriptionPlainText:
      'A Jupyter Notebook on applying the DFT to timeseries data for seasonality detection.',
    contentPath: 'jupyter_notebooks/DftTimeseries',
    type: 'article',
  },
  {
    path: '/web_development/react_bootstrap_site_generator',
    title: 'React Bootstrap Site Generator',
    date: 'Jan 6 2018',
    disqusId: 'ReactBootstrapSiteGenerator',
    description: (
      <div>
        <p>
          <i>React Bootstrap Site Generator</i> is an npm package designed to
          make creating sites like this one super quick!
        </p>
        <img
          src={site_generator_demo}
          alt="Demo gif of site generator"
          style={{ width: '50%' }}
        />
      </div>
    ),
    descriptionPlainText:
      "react-scripts-bootstrap-site-generator (https://github.com/khiner/react-scripts-bootstrap-site-generator) is an npm package built on top of the `react-scripts` configuration and scripts used by Create React App. It's designed to work as a crazy simple, opinionated static site generator designed to make creating simple static sites super fast.",
    contentPath: 'web_development/ReactBootstrapSiteGenerator',
  },
  {
    path: '/beatbot',
    title: 'BeatBot',
    subtitle:
      'An App Release Announcement and a Reflection on Managing Complex Passion Projects',
    date: 'Jan 28 2018',
    disqusId: 'BeatBot',
    description: (
      <div>
        <p>
          <i>BeatBot</i> is an intuitive and flexible beat production
          environment. It provides the essential sound design tools for rich
          sample-based beat production with an interface designed to take full
          advantage of the expressive capability of multitouch interaction on a
          mobile form factor.
        </p>
        <p>
          BeatBot aims to be simple and intuitive so you can express your ideas
          quickly, while also being flexible and powerful enough to refine
          sketches into full productions.
        </p>
        <div className="videoWrapper">
          <iframe
            title="BeatBot Demo"
            src="https://www.youtube.com/embed/XX6qeg30LSo"
            scrolling="no"
            frameBorder="0"
          />
        </div>
      </div>
    ),
    descriptionPlainText:
      'BeatBot is an intuitive and flexible beat production environment. It provides the essential sound design tools for rich sample-based beat production with an interface designed to take full advantage of the expressive capability of multitouch interaction on a mobile form factor. BeatBot aims to be simple and intuitive so you can express your ideas quickly, while also being flexible and powerful enough to refine sketches into full productions.',
    contentPath: 'beatbot/BeatBot',
  },
  {
    path: '/jupyter_notebooks/python_for_data_analysis',
    summaryTitle: 'Jupyter Notebook - Python for Data Analysis',
    title: 'Python for Data Analysis',
    date: 'Feb 9 2018',
    disqusId: 'PythonForDataAnalysis',
    description: (
      <div>
        <p>
          This Jupyter Notebook contains all code and corresponding output from
          the <i>Python for Data Analysis</i> book by Wes McKinney.
        </p>
        <img
          src={python_for_data_analysis_preview_image}
          alt="Preview of chart from Python for Data Analysis book"
          style={{ width: '80%' }}
        />
      </div>
    ),
    descriptionPlainText:
      'This Jupyter Notebook contains all code and corresponding output from the "Python for Data Analysis" book by Wes McKinney.',
    contentPath: 'jupyter_notebooks/PythonForDataAnalysis',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/accelerated_cpp',
    summaryTitle: 'Jupyter Notebook - Accelerated C++',
    title: 'Accelerated C++',
    date: 'Mar 3 2018',
    disqusId: 'AcceleratedC++',
    description: (
      <div>
        <p>
          This Jupyter Notebook contains all code and exercises for the{' '}
          <i>Accelerated C++</i> book.
        </p>
        <img
          src={accelerated_cpp_preview_image}
          alt="Preview of code from the Accelerated C++"
          style={{ width: '80%' }}
        />
      </div>
    ),
    descriptionPlainText:
      'This Jupyter Notebook contains all code and exercises for the "Accelerated C++" book.',
    contentPath: 'jupyter_notebooks/AcceleratedCpp',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/coding_the_matrix',
    summaryTitle:
      'Jupyter Notebook - Coding the Matrix: Linear Algebra through Applications to Computer Science',
    title: 'Coding the Matrix',
    subtitle: 'Linear Algebra through Applications to Computer Science',
    date: 'Mar 30 2018',
    disqusId: 'CodingTheMatrix',
    description: (
      <div>
        <p>
          This Jupyter Notebook contains all code, problems and labs for the{' '}
          <i>Coding the Matrix</i> book.
        </p>
        <img
          src={coding_the_matrix_preview_image}
          alt="Preview of perspective transformation"
          style={{ width: '80%' }}
        />
      </div>
    ),
    descriptionPlainText:
      'This Jupyter Notebook contains all code, problems and labs for the "Coding the Matrix" book.',
    contentPath: 'jupyter_notebooks/CodingTheMatrix',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/musimathics_volume_1',
    summaryTitle: 'Jupyter Notebook - Musimathics Volume 1',
    title: 'Musimathics Volume 1',
    subtitle: 'The Mathematical Foundations of Music',
    date: 'Apr 19 2018',
    disqusId: 'MusimathicsVolume1',
    description: (
      <div>
        <p>
          This Jupyter Notebook contains implementations of many interesting
          topics from the <i>Musimathics Volume 1</i> book.
        </p>
        <img
          src={musimathics_volume_1_preview_image}
          alt="Preview gif of Musimathics Volume 1 showing particle displacement in a tube"
          style={{ width: '80%' }}
        />
      </div>
    ),
    descriptionPlainText:
      'This Jupyter Notebook contains implementations of many interesting topics from the "Musimathics Volume 1" book.',
    contentPath: 'jupyter_notebooks/MusimathicsVolume1',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/musimathics_volume_2',
    summaryTitle: 'Jupyter Notebook - Musimathics Volume 2',
    title: 'Musimathics Volume 2',
    subtitle: 'The Mathematical Foundations of Music',
    date: 'May 7 2018',
    disqusId: 'MusimathicsVolume2',
    description: (
      <div>
        <p>
          This Jupyter Notebook contains demonstrations and visualizations of
          many topics from the <i>Musimathics Volume 2</i> book.
        </p>
        <img
          src={musimathics_volume_2_preview_image}
          alt="Preview gif of Musimathics Volume 2 showing"
          style={{ width: '80%' }}
        />
      </div>
    ),
    descriptionPlainText:
      'This Jupyter Notebook contains implementations of many interesting topics from the "Musimathics Volume 2" book.',
    contentPath: 'jupyter_notebooks/MusimathicsVolume2',
    type: 'article',
  },
]

export default entries
