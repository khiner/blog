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
import intro_to_digital_filters_preview_image from './content/jupyter_notebooks/assets/intro_to_digital_filters/two_pole_filter_animation.gif'
import mathematics_of_the_dft_preview_image from './content/jupyter_notebooks/assets/mathematics_of_the_dft_preview.png'
import musimathics_volume_1_preview_image from './content/jupyter_notebooks/assets/musimathics/musimathics_volume_1_preview.gif'
import musimathics_volume_2_preview_image from './content/jupyter_notebooks/assets/musimathics/musimathics_volume_2_preview.gif'
import pasp_preview_image from './content/jupyter_notebooks/assets/pasp/chapter_9_pick_excitation.gif'
import python_crash_course_preview_image from './content/jupyter_notebooks/assets/python_crash_course_preview.png'
import python_for_data_analysis_preview_image from './content/jupyter_notebooks/assets/python_for_data_analysis_preview.png'
import sound_machine_preview_image from './content/sound_machine/assets/sound_machine_short_demo.gif'
import windowing_animation from './content/jupyter_notebooks/assets/windowing_animation.gif'

import site_generator_demo from './content/web_development/assets/site_generator_demo.gif'

import mesh_editor_preview from './content/mesh_audio_editor/assets/RealImpact_CeramicPitcher.png'

const entries = [
  {
    path: '/albums/web_tracks_2006_2011',
    summaryTitle: 'Album - Web Tracks 2006 - 2011',
    title: 'Web Tracks 2006 - 2011',
    date: 'May 30 2011',
    description: (
      <div>
        <p>
          A bunch of random tracks ranging from about 2006-2011. Playful bedroom experiments. Some are just goofy, some
          are more serious. Some good ideas, some not so much. All of them mastered terribly.
        </p>
        <AlbumPreview title="Web Tracks 2006 - 2011" playlistId="3066212" />
      </div>
    ),
    contentPath: 'albums/WebTracks2006To2011',
    type: 'article',
  },
  {
    path: '/albums/calahjes_and_lewps',
    summaryTitle: 'Album - Calahjes&Lewps',
    title: 'Calahjes&Lewps',
    date: 'Dec 22 2011',
    description: (
      <div>
        <p>Stream of consciousness frenetic sampling from musical sources.</p>
        <AlbumPreview title="Calahjes & Lewps" playlistId="1425406" />
      </div>
    ),
    contentPath: 'albums/CalahjesAndLewps',
    type: 'article',
  },
  {
    path: '/albums/make_noise_shared_system_jams',
    summaryTitle: 'Album - MakeNoise Shared System Jams',
    title: 'MakeNoise Shared System Jams',
    date: 'Jan 27 2016',
    description: (
      <div>
        <p>Modular synth patches, made mostly using the Make Noise Shared System.'</p>
        <img src={make_noise_shared_system_image} alt="Make Noise Shared System" />
        <AlbumPreview title="MakeNoise Shared System Jams" playlistId="63454085" />
      </div>
    ),
    contentPath: 'albums/MakeNoiseSharedSystemJams',
    type: 'article',
  },
  {
    path: '/albums/midi_markov_compose',
    summaryTitle: 'Album - MIDI Markov: Compose',
    title: 'MIDI Markov: Compose',
    date: 'Sep 1 2016',
    description: (
      <div>
        <p>Piano compositions generated from a Markov chain given classical MIDI scores as input.</p>
        <AlbumPreview title="MidiMarkov: Compose" playlistId="257076049" />
      </div>
    ),
    contentPath: 'albums/MidiMarkovCompose',
    type: 'article',
  },
  {
    path: '/albums/midi_markov_decompose',
    summaryTitle: 'Album - MIDI Markov: Decompose',
    title: 'MIDI Markov: Decompose',
    date: 'Sep 2 2016',
    description: (
      <div>
        <p>
          Piano compositions generated from a Markov chain given classical MIDI scores as input. Unlike the "MIDI
          Markov: Compose" album, these pieces introduce intentional MIDI errors to generate more experimental, ambient
          pieces.
        </p>
        <AlbumPreview title="MidiMarkov: Decompose" playlistId="257110789" />
      </div>
    ),
    contentPath: 'albums/MidiMarkovDecompose',
    type: 'article',
  },
  {
    path: '/albums/web_tracks_2012_2017',
    summaryTitle: 'Album - Web Tracks 2012-2017',
    title: 'Web Tracks 2012-2017',
    date: 'Nov 1 2017',
    description: (
      <div>
        <p>
          A collection of tracks I published spanning from 2012 to 2017. There isn't any cohesive theme. Special guests
          Andrew Knight (on Riders of the Night - the Raccoon Song) and pLiskin (on Elise and Paw).
        </p>
        <AlbumPreview title="Web Tracks 2012 - 2017" playlistId="5017148" />
      </div>
    ),
    contentPath: 'albums/WebTracks2012To2017',
    type: 'article',
  },
  {
    path: '/processing/string_pluck',
    summaryTitle: 'Processing Sketch - String Pluck',
    title: 'String Pluck',
    date: 'Feb 16 2015',
    description: (
      <div>
        <p>Interactive model of plucked string motion.</p>
        <img src={pluck_equation_image} alt="Equation for plucked string" />
      </div>
    ),
    contentPath: 'processing/StringPluck',
    type: 'showcase',
  },
  {
    path: '/processing/snow_globe',
    summaryTitle: 'Processing Sketch - Snow Globe',
    title: 'Snow Globe',
    date: 'Feb 16 2015',
    description: (
      <div>
        <p>
          Some fun with edge detection. This simple effect, when used on images like cityscapes, looks like a blizzard.
        </p>
        <img src={snow_globe_image} alt="Preview of Snow Globe sketch" />
      </div>
    ),
    contentPath: 'processing/SnowGlobe',
    type: 'showcase',
  },
  {
    path: '/processing/retrograde_motion',
    summaryTitle: 'Processing Sketch - Apparent Retrograde Motion',
    title: 'Apparent Retrograde Motion',
    date: 'Feb 15 2016',
    description: (
      <div>
        <p>
          Retrograde motion is the apparent motion of a planet to move in a direction opposite to that of other bodies
          within its system, as observed from a particular vantage point.
        </p>
        <img src={apparent_retrograde_motion_image} alt="Preview of Retrograde Motion sketch" />
      </div>
    ),
    contentPath: 'processing/RetrogradeMotion',
    type: 'showcase',
  },
  {
    path: '/processing/force_graph',
    summaryTitle: 'Processing Sketch - Force-Directed Graph',
    title: 'Force-Directed Graph',
    date: 'July 31 2016',
    description: (
      <div>
        <p>Mapping a force-directed graph to an image for bouncy stretching and warping.</p>
        <img src={mario_warped_image} alt="Mario warped with force-directed graph" style={{ width: '40%' }} />
      </div>
    ),
    contentPath: 'processing/ForceGraph',
    type: 'showcase',
  },
  {
    path: '/music_generation/midi_markov',
    title: 'Generating MIDI with Markov Chains',
    date: 'Aug 28 2016',
    description: (
      <div>
        <p>
          MidiMarkov is a command-line tool that uses a Markov process to generate MIDI streams based on a given folder
          of MIDI source material.
        </p>
        <img src={beethovens_5th_image} alt="Section of Beethoven's 5th symphony melody" />
      </div>
    ),
    contentPath: 'music_generation/MidiMarkov',
    type: 'article',
  },
  {
    path: '/music_generation/auto_sampler',
    title: 'AutoSampler for Max4Live',
    date: 'Sep 8 2016',
    description: (
      <div>
        <p>
          AutoSampler is an intelligent Max4Live instrument that plays audio segments found in your library matching the
          notes of incoming live MIDI.
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
    contentPath: 'music_generation/AutoSampler',
    type: 'article',
  },
  {
    path: '/processing/bubble_wrap',
    summaryTitle: 'Processing Sketch - Bubble Wrap',
    title: 'Bubble Wrap',
    date: 'Dec 19 2017',
    description: (
      <div>
        <p>A simple sketch with for trippy, colorful bubble patterns.</p>
        <img src={bubble_wrap_preview_image} alt="Preview of Bubble Wrap sketch" />
      </div>
    ),
    contentPath: 'processing/BubbleWrap',
    type: 'showcase',
  },
  {
    path: '/jupyter_notebooks/python_crash_course',
    summaryTitle: 'Jupyter Notebook - Python Crash Course',
    title: 'Python Crash Course',
    date: 'Dec 20 2017',
    description: (
      <div>
        <p>
          This Jupyter Notebook contains all code, excercises and projects from the "Python Crash Course" book by Eric
          Matthes, including three projects: a "Space Invaders"-style game developed with PyGame, a data visualization
          project and a Django app.
        </p>
        <img
          src={python_crash_course_preview_image}
          alt="Preview of random walk chart from Python Crash Course book"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/PythonCrashCourse',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/dft_timeseries',
    summaryTitle: 'Jupyter Notebook - DFT for timeseries data',
    title: 'DFT for timeseries data',
    date: 'Jan 3 2018',
    description: (
      <div>
        <p>
          I developed this Jupyter Notebook for a presentation on applying the DFT to timeseries data for seasonality
          detection.
        </p>
        <img src={windowing_animation} alt="Animation of windowing's affect on the DFT with pure sinusoids" />
      </div>
    ),
    contentPath: 'jupyter_notebooks/DftTimeseries',
    type: 'article',
  },
  {
    path: '/web_development/react_bootstrap_site_generator',
    title: 'React Bootstrap Site Generator',
    date: 'Jan 6 2018',
    description: (
      <div>
        <p>
          <i>React Bootstrap Site Generator</i> is an npm package designed to make creating sites like this one super
          quick!
        </p>
        <img src={site_generator_demo} alt="Demo gif of site generator" style={{ width: '50%' }} />
      </div>
    ),
    contentPath: 'web_development/ReactBootstrapSiteGenerator',
  },
  {
    path: '/beatbot',
    title: 'BeatBot',
    subtitle: 'Android app release announcement',
    date: 'Jan 28 2018',
    description: (
      <div>
        <p>BeatBot is an Android-native DAW for sample-based beat production.</p>
        <div className="videoWrapper">
          <iframe title="BeatBot Demo" src="https://www.youtube.com/embed/XX6qeg30LSo" scrolling="no" frameBorder="0" />
        </div>
      </div>
    ),
    contentPath: 'beatbot/BeatBot',
  },
  {
    path: '/jupyter_notebooks/python_for_data_analysis',
    summaryTitle: 'Jupyter Notebook - Python for Data Analysis',
    title: 'Python for Data Analysis',
    date: 'Feb 9 2018',
    description: (
      <div>
        <p>
          This Jupyter notebook contains all code and corresponding output from the <i>Python for Data Analysis</i> book
          by Wes McKinney.
        </p>
        <img
          src={python_for_data_analysis_preview_image}
          alt="Preview of chart from Python for Data Analysis book"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/PythonForDataAnalysis',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/accelerated_cpp',
    summaryTitle: 'Jupyter Notebook - Accelerated C++',
    title: 'Accelerated C++',
    date: 'Mar 3 2018',
    description: (
      <div>
        <p>
          This set of Jupyter notebooks contains all code and exercises for the <i>Accelerated C++</i> book.
        </p>
        <img
          src={accelerated_cpp_preview_image}
          alt="Preview of code from the Accelerated C++"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/AcceleratedCpp',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/coding_the_matrix',
    summaryTitle: 'Jupyter Notebook - Coding the Matrix: Linear Algebra through Applications to Computer Science',
    title: 'Coding the Matrix',
    subtitle: 'Linear Algebra through Applications to Computer Science',
    date: 'Mar 30 2018',
    description: (
      <div>
        <p>
          This set of Jupyter notebooks contains all code, problems and labs for the <i>Coding the Matrix</i> book.
        </p>
        <img
          src={coding_the_matrix_preview_image}
          alt="An example of perspective transformation"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/CodingTheMatrix',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/musimathics_volume_1',
    summaryTitle: 'Jupyter Notebook - Musimathics Volume 1',
    title: 'Musimathics Volume 1',
    subtitle: 'The Mathematical Foundations of Music',
    date: 'Apr 19 2018',
    description: (
      <div>
        <p>
          This Jupyter notebook contains implementations of many interesting topics from the <i>Musimathics Volume 1</i>{' '}
          book.
        </p>
        <img
          src={musimathics_volume_1_preview_image}
          alt="Preview gif for Musimathics Volume 1 showing particle displacement in a tube"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/MusimathicsVolume1',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/musimathics_volume_2',
    summaryTitle: 'Jupyter Notebook - Musimathics Volume 2',
    title: 'Musimathics Volume 2',
    subtitle: 'The Mathematical Foundations of Music',
    date: 'May 7 2018',
    description: (
      <div>
        <p>
          Jupyter notebooks full of demonstrations and visualizations of many topics from the{' '}
          <i>Musimathics Volume 2</i> book.
        </p>
        <img
          src={musimathics_volume_2_preview_image}
          alt="Preview gif for Musimathics Volume 2 showing a visualization of how the foureir transform works"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/MusimathicsVolume2',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/mathematics_of_the_dft',
    summaryTitle: 'Jupyter Notebook - Mathematics of the DFT',
    title: 'Mathematics of the DFT',
    date: 'May 25 2018',
    description: (
      <div>
        <p>
          This set of Jupyter notebooks contains charts, visualizations, demonstrations and excercise solutions for each
          of the chapters in the <i>Mathematics of the DFT</i> book by Julius O. Smith III.
        </p>
        <img
          src={mathematics_of_the_dft_preview_image}
          alt="Charts showing the equivalence of stretching in the time domain and repeating in the frequency domain"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/MathematicsOfTheDft',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/intro_to_digital_filters',
    summaryTitle: 'Introduction to Digital Filters',
    title: 'Introduction to Digital Filters',
    subtitle: 'Jupyter notebooks and a geometric interpretation of digital audio filters',
    date: 'June 16 2018',
    description: (
      <div>
        <p>
          Another set of Jupyter notebooks! These ones cover the{' '}
          <i>Introduction to Digital Filters: with Audio Applications</i> book by Julius O. Smith III, including more
          mathy charts, animations and explorations, as well as solutions/attempts for (almost) every excercise.
        </p>
        <p>Also, I walk through a graphical method of interpretting and designing digital filters.</p>
        <img
          src={intro_to_digital_filters_preview_image}
          alt="Animation showing a biquad filter's amplitude, phase and impulse responses as the poles are moved"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/IntroductionToDigitalFilters',
    type: 'article',
  },
  {
    path: '/sound_machine/sound_machine',
    title: 'Sound Machine',
    subtitle: 'Making a place to put audio-making things',
    date: 'Aug 25 2018',
    description: (
      <div>
        <p>
          The beginning of an ongoing project to try and make a flexible, fast and fun music production and performance
          tool that I will actually use.
        </p>
        <img src={sound_machine_preview_image} alt="preview of sound machine" style={{ width: '80%' }} />
      </div>
    ),
    contentPath: 'sound_machine/SoundMachine',
    type: 'article',
  },
  {
    path: '/music_generation/wavenet_and_samplernn',
    title: 'Generating Music with WaveNet and SampleRNN',
    date: 'Aug 11 2019',
    description: (
      <div>
        <p>
          Most raw audio generation papers focus on speech. If musical audio samples are published, they're usually the
          result of training on simple single-instrument recordings. I wanted to explore how two popular audio
          generation models generalize to more complex and musically interesting audio.
        </p>
        <AlbumPreview title="SampleRNN Dawn of Midi" playlistId="825451859" />
      </div>
    ),
    contentPath: 'music_generation/DeepModels',
    type: 'article',
  },
  {
    path: '/jupyter_notebooks/physical_audio_signal_processing',
    title: 'Audiovisual Guide to Physical Audio Signal Processing',
    subtitle: 'Companion Jupyter Notebooks for "Physical Audio Signal Processing" by J. O. Smith III',
    date: 'Jan 1 2020',
    description: (
      <div>
        <p>
          Continuing with Julius O. Smith III's audio DSP series, this set of Jupyter notebooks covers book III -{' '}
          <i>Physical Audio Signal Processing</i>.
        </p>
        <img
          src={pasp_preview_image}
          alt="Animation showing digital waveguide delay lines with excitation scatter junction"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'jupyter_notebooks/PhysicalAudioSignalProcessing',
    type: 'article',
  },
  {
    path: '/mesh_audio_editor',
    title: 'Mesh Audio Editor (coming soon)',
    subtitle: "I'm busy finishing up my last semester of my Master's at Georgia Tech.",
    date: 'Apr 5 2024',
    description: (
      <div>
        <p>
          Hi :) I haven't posted since 2020 but I've been working on lots of fun and intersting things! I'm busy
          finishing up my last semester of my Master's degree in Computational Science and Engineering at Georgia Tech.
          I've been working hard on lots of things for two years, and will post them here soon! (and do a full redesign
          shortly after that I hope, this one is from 2016/17 and looks/feels it O_o)
        </p>
        <p>In the meantime, my GitHub is the best place to see what I've been up to (see link in header).</p>
        <p>
          I am looking for interesting and exciting work opportunities after graduation, especially related to
          simulation, augmented and virtual realities, digital audio/graphics, creative digital media production
          applications/tools, and similar areas. If you are aware of any positions you think I would be a good fit for,
          please let me know!
        </p>
        <p>
          Below is a screenshot of the project I'm currently working on - a mesh and rigid body physical audio model
          editor.
        </p>
        <img
          src={mesh_editor_preview}
          alt="Wooden plate mesh in the RealImpact mesh editor, with a listener position (reprecented by a cylinder) selected and the modal audio control panel open"
          style={{ width: '80%' }}
        />
      </div>
    ),
    contentPath: 'mesh_audio_editor/MeshAudioEditor',
    type: 'article',
  },
]

export default entries
