import Audio from '../Audio'
import Image from 'components/Image'
import Link from 'components/Link'
import { Python } from '../CodeBlock'

import artificial_reverb from './assets/pasp/artificial_reverb.wav'
import chapter_4_animation from './assets/pasp/chapter_4_sinc.gif'
import chapter_6_animation from './assets/pasp/chapter_6_waveguide.gif'
import chapter_7_animation from './assets/pasp/chapter_7_roc.gif'
import chapter_7_animation_2 from './assets/pasp/chapter_7_s_z_plane.gif'
import chapter_8_animation from './assets/pasp/chapter_8_allpass_chain.gif'
import chapter_9_brightness_sustain_lf from './assets/pasp/chapter_9_brightness_sustain_lf.gif'
import chapter_9_waveguide_pluck from './assets/pasp/chapter_9_waveguide_pluck.gif'
import chapter_9_pick_excitation from './assets/pasp/chapter_9_pick_excitation.gif'
import chapter_9_dispersion from './assets/pasp/chapter_9_dispersion.gif'
import hammer_pulses from './assets/pasp/hammer_pulses.png'
import piano_edr from './assets/pasp/piano_edr.png'
import clarinet_chain from './assets/pasp/clarinet_chain.png'

import delayed_1 from './assets/pasp/delayed_1.wav'
import delayed_2 from './assets/pasp/delayed_2.wav'
import delayed_3 from './assets/pasp/delayed_3.wav'
import delayed_4 from './assets/pasp/delayed_4.wav'
import delayed_5 from './assets/pasp/delayed_5.wav'
import delayed_6 from './assets/pasp/delayed_6.wav'
import delayed_7 from './assets/pasp/delayed_7.wav'
import delayed_8 from './assets/pasp/delayed_8.wav'
import delayed_9 from './assets/pasp/delayed_9.wav'
import delayed_10 from './assets/pasp/delayed_10.wav'
import simple_strum from './assets/pasp/simple_strum.wav'
import guitar_pick from './assets/pasp/guitar_pick.wav'
import guitar_strum from './assets/pasp/guitar_strum.wav'
import piano_arpeggio from './assets/pasp/piano_arpeggio.wav'
import piano_single_key from './assets/pasp/piano_single_key.wav'
import clarinet from './assets/pasp/clarinet.wav'

const allDelayAudios = [
  delayed_1,
  delayed_2,
  delayed_3,
  delayed_4,
  delayed_5,
  delayed_6,
  delayed_7,
  delayed_8,
  delayed_9,
  delayed_10,
]

export default (
  <div>
    <p>
      This set of{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/index.ipynb">
        Jupyter notebooks
      </Link>{' '}
      covers each chapter of the third book in Julius O. Smith III's excellent four-book series on audio DSP,{' '}
      <Link href="https://ccrma.stanford.edu/~jos/pasp/">Physical Audio Signal Processing</Link>. Armed with the tools
      from the <Link href="https://karlhiner.com/jupyter_notebooks/mathematics_of_the_dft">previous</Link>{' '}
      <Link href="https://karlhiner.com/jupyter_notebooks/intro_to_digital_filters">books</Link>, we are introduced to
      some powerful synthesis techniques capable of producing some pretty convincing emulations of real, physical
      instruments.
    </p>
    <p>
      There's a notebook for each chapter, culminating with a three-part final chapter that walks through the
      implementation of three real-time-capable virtual instruments:{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_9_virtual_musical_instruments.ipynb">
        guitars
      </Link>
      ,{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_9_virtual_musical_instruments_part_2.ipynb">
        pianos
      </Link>{' '}
      and{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_9_virtual_musical_instruments_part_3.ipynb">
        woodwinds
      </Link>
      . To view and run the full, interactive set of notebooks, open them in{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/index.ipynb">
        Colab
      </Link>{' '}
      <small>
        (
        <Link href="https://github.com/khiner/notebooks/tree/master/physical_audio_signal_processing/">
          raw Github link
        </Link>
        ).
      </small>{' '}
      <i>
        Note: these will generally look bad in Colab's dark mode. From top menu, select Tools {'->'} Settings. Under
        Theme, select "light".
      </i>
    </p>
    <h2>What is physical audio signal processing?</h2>
    <p>
      From the perspective of musical synthesis, physical modeling is all about making <i>digital things</i> that sound
      like <i>physical things</i>. The basic insight that fuels physical modeling research is this: if we simulate the
      behavior of physical systems (like musical instruments) over time, to a certain degree of accuracy, and then
      extract audio signals from appropriate points of the simulated system, those signals should resemble the audio
      emitted from the corresponding points of the real-world physical system being modeled.
    </p>
    <p>
      Other synthesis techniques, such as{' '}
      <Link href="https://en.wikipedia.org/wiki/Subtractive_synthesis">subtractive synthesis</Link> or{' '}
      <Link href="https://en.wikipedia.org/wiki/Frequency_modulation_synthesis">FM synthesis</Link>, are sometimes used
      to emulate physical sounds. However, this is usually done by ear, using parameters that don't fundamentally
      correspond to a purely physical interpretation. For example, sound designers may use FM synthesis to approximate
      the spectral properties of brass instruments or bells, but there is no physical analogy to the FM modulation - it
      is an abstract mathematical operation. One of the promises of the physical modeling approach is that, in
      principle, we don't need to be particularly <i>creative</i> to get the results we're looking for. We can use the
      reductive tools of experimental science, breaking the system down to its constituent parts, studying them
      individually, and developing digital algorithms to emulate their behavior to some acceptable degree of accuracy.
      For the most part, we can accomplish this with relatively simple and well-understood concepts in physics.
    </p>
    <p>
      Where much of the creativity comes in is making something that can actually run in real-time on devices like
      laptops and phones. Real-time digital instruments have the strong design constraint of needing to produce tens of
      thousands audio samples every second. This means it's not usually enough to just blindly translate physical
      systems to their digital counterparts. Instead, we need to find clever ways to model only the parts of the system
      most relevant to the thing we care about - the audio. (In fact, we only really care about the audio that is
      available to our{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_6_psychophysical_basis_of_sound.ipynb">
        perception
      </Link>{' '}
      - a fact which provides another avenue for optimization.) Making tradeoffs between accuracy, efficiency and
      physical interpretability is a big part of what this field, and this book, is all about.
    </p>
    <h2>Why I'm excited about physical audio modeling</h2>
    <p>
      Having access to real-time controllable virtual instruments that sound like real instruments is incredibly
      valuable on its own. However, there are many other exciting aspects of physical audio models that we get "for
      free":
    </p>
    <ul>
      <li>
        <strong>Intuitive control</strong>
        <p>
          Physical models have physically meaningful parameters of control. For example, we can change the length or
          tension of a string, the position of a violin bow, the stiffness of a clarinet reed, or the mass of a guitar
          pick. Because we're modeling these aspects directly, we get direct control for free.
        </p>
      </li>
      <li>
        <strong>Mutability</strong>
        <p>
          Unlike instruments in the real world, we can in principle change <i>any</i> aspect of a virtual instrument. I
          can't change the material properties of my real guitar's wooden body, or the shape of the hammers in my piano.
          These are <i>immutable</i> properties of the instruments I bought. With virtual instruments, these properties
          can not only be changed, but can often be changed <i> in real-time</i>.
        </p>
      </li>
      <li>
        <strong>Modularity</strong>
        <p>
          Physical systems are naturally modular and hierarchically composed. Most techniques (like digital waveguides)
          model physical relationships in a way that reflects this, with a modular design. A string is modeled with a
          delay line, which has inputs and outputs at discrete positions along its length. A guitar bridge is modeled
          with a digital filter with multiple inputs and outputs.
        </p>
        <p>
          This allows for combining model components in musically creative ways. For example, there's no reason we
          couldn't send a <i>force</i> wave signal into something expecting a <i>velocity</i> input. Or (as is actually
          done in <Link href="https://ccrma.stanford.edu/~jos/pasp/Commuted_Synthesis.html">commuted synthesis</Link>)
          we can excite a string with the impulse response of a piano soundboard. In other words, anything can be hooked
          up to anything. There's no need to constrain ourselves to what's physically plausible. Experimenting with{' '}
          <i>connectivity</i> in low-level DSP architecture is a powerful dimension of control that is not often exposed
          in audio software, and is something I'm excited to pursue further.
        </p>
      </li>
      <li>
        <strong>Scalability</strong>
        <p>
          I mentioned the tradeoff between accuracy and efficiency above. In many cases, it is actually <i>simpler</i>{' '}
          to make a physically accurate model if computational complexity isn't a concern. A lot of complexity in
          physical modeling comes from "hacks" that make things faster, but also less physically interpretable. For
          example,{' '}
          <Link href="https://github.com/grame-cncm/faust/blob/master-dev/tools/physicalModeling/mesh2faust/README.md">
            this tool
          </Link>{' '}
          transforms a volumetric mesh of a 3D object into a modal physical model in{' '}
          <Link href="https://faust.grame.fr/">Faust</Link>. The realism of the resulting model, and the computational
          complexity, will scale with the number of mesh vertices included in the transformation.
        </p>
        <p>
          Physical modeling techniques, perhaps more so than other synthesis techniques, have a capacity for improvement
          by simply throwing more hardware at the problem. This means the possibilities available to us will grow with
          hardware capabilities. In particular, I'm excited to see how this influences{' '}
          <Link href="https://www.researchgate.net/publication/263020611_Modular_Physical_Modeling_Synthesis_Environments_on_GPU">
            the role of GPUs
          </Link>{' '}
          in music production in the future.
        </p>
      </li>
      <li>
        <strong>Exploring the unreal</strong>
        <p>
          Once the physical aspects of an instrument are digitally modeled and parameterized, there's nothing stopping
          us from changing parameter values to ones that are physically ridiculous. As an example, researchers at the
          University of Edinburgh created{' '}
          <Link href="http://www.ness.music.ed.ac.uk/archives/systems/brass-instruments-2">
            a brass instrument model
          </Link>{' '}
          "using traditional instrument geometries along with a 10m long trumpet". Of course, geometry isn't the only
          thing we can get crazy with. Everything down to the most basic laws of physics are mutable in a computational
          model!
        </p>
      </li>
    </ul>
    <h2>About these notebooks</h2>
    <p>
      This book has the most material of the series, with about 430 dense pages of material, and an additional 300 pages
      in the appendices. I don't attempt to make a "definitive guide" with these notebooks. Instead, I focus on some of
      the things I found most interesting, or fundamental, or challenging or confusing to me. These notebooks don't
      stand alone as educational material, and should be thought of as a companion to go along with the book. Many parts
      are lacking in explanation, deferring to the text, which is{' '}
      <Link href="https://ccrma.stanford.edu/~jos/pasp/">available for free online</Link>. Solutions are provided to
      many of the exercises, problems and labs (which are only available in the{' '}
      <Link href="https://www.amazon.com/Physical-Audio-Signal-Processing-Instruments/dp/0974560723">
        physical book
      </Link>
      ). My main goal with these and my other notebook sets is to help myself and others understand the material in the
      book.
    </p>
    <p>
      Some notebooks go into much greater depth than others. The first two chapters are basically just my solutions to
      the exercises, while in later chapters I started to feel bogged down by the theoretical work and focused more on
      implementations and visualizations. The last chapter (accounting for almost a third of the book's material) is
      split up into three notebooks. If you're curious about what all this physical modeling stuff is about and just
      want to see some end results, those would be the ones to skim through!
    </p>
    <p>
      Finally, a disclaimer that there are probably a lot of errors, technically incorrect statements, etc. There were
      many exercises I looked at and had absolutely no idea what to do. There aren't a ton of resources on this stuff
      out there, which is a big part of the reason for doing this work. If you see something wrong, or missing, or
      incomplete or could be better, please reach out!
    </p>
    <h2>Preview</h2>
    <p>
      The rest of this post is a small sample of some of the visualizations and audio in these notebooks, to share a
      broad sense of what's there. For explanations and much more content, follow the chapter links, or start from{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/index.ipynb">
        the index
      </Link>
      .{' '}
      <i>
        (Note: The animations here are just gifs, but in the Colab links, all animations are rendered in a Javascript
        player with playback controls.)
      </i>
    </p>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_1_physical_signal_modeling_intro.ipynb">
        Chapter 1: Physical Signal Modeling Intro
      </Link>
    </h3>
    <p>
      <i>Mostly just exercise solutions in this chapter.</i>
    </p>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_2_acoustic_modeling_with_digital_delay.ipynb">
        Chapter 2: Acoustic Modeling with Digital Delay
      </Link>
    </h3>
    <p>
      <i>Same here.</i>
    </p>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_3_artificial_reverberation.ipynb">
        Chapter 3: Artificial Reverberation
      </Link>
    </h3>
    <Python>{`fs, samples = readwav('FDNJot4LPIR-speech-male.wav')
Audio(samples, rate=fs)`}</Python>
    <Audio src={artificial_reverb} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_4_delay_line_and_signal_interpolation.ipynb">
        Chapter 4: Delay Line and Signal Interpolation
      </Link>
    </h3>
    <Image src={chapter_4_animation} alt="Animation showing reconstruction of signal with sinc convolution" />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_5_time_varying_delay_effects.ipynb">
        Chapter 5: Time-Varying Delay Effects
      </Link>
    </h3>
    <p>
      In the following examples, we can hear a diverse range of qualities produced from a simple delay line, ranging (in
      order) from chipmunky pitch-raising, to flanging & doubling effects, pitch-dropping, pitch-changing reverse, and
      feedback-like spectral buzzing:
    </p>
    <Python>{`delay = Delay(fs)
delay_growths = [-2, -1, 0.0001, 0.001, 0.01, 0.1, 2, 3, 10, 100]

delayed_set = []
for delay_growth in delay_growths:
    delay.set_delay_samples(0)
    delay.set_delay_growth_samples(delay_growth)
    delayed_set.append(Audio(delay.tick_all(samples), rate=fs))

delayed_set`}</Python>
    {allDelayAudios.map((delayAudio, i) => (
      <Audio key={i} src={delayAudio} />
    ))}
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_6_digital_waveguide_models.ipynb">
        Chapter 6: Digital Waveguide Models
      </Link>
    </h3>
    <Image src={chapter_6_animation} alt="Animation showing simple traveling wave components" />
    <Python>{`notes = np.array([1, 5, 8, 12, 13]) # 7 chord
root_hz = 110 # low A
notes_hz = root_hz * 2**(notes / 12)
note_length_seconds = 4
between_notes_seconds = 1 / 16
strum_samples = np.zeros(int(fs * (note_length_seconds + between_notes_seconds * notes.size)))
for i, note_hz in enumerate(notes_hz):
    offset_samples = int(i * fs * between_notes_seconds)
    for frequency in [note_hz, note_hz + 0.2]:
        strum_samples[offset_samples:offset_samples + fs * note_length_seconds] += generate_pluck(frequency, length_seconds=note_length_seconds, fs=fs)

display.Audio(strum_samples, rate=fs)`}</Python>
    <Audio src={simple_strum} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_7_lumped_models.ipynb">
        Chapter 7: Lumped Models
      </Link>
    </h3>
    <Image src={chapter_7_animation} alt="Animation showing region of convergence in s and z planes" />
    <img
      src={chapter_7_animation_2}
      alt="Animation showing transformation between s and z planes"
      style={{ width: '60%' }}
    />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_8_transfer_function_models.ipynb">
        Chapter 8: Transfer Function Models
      </Link>
    </h3>
    <Image src={chapter_8_animation} alt="Animation showing frequency response and pole-zero plots for allpass chain" />
    <h3>Chapter 9: Virtual Musical Instruments</h3>
    <h4>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_9_virtual_musical_instruments.ipynb">
        Part 1: Guitars and String Excitations
      </Link>
    </h4>
    <Image
      src={chapter_9_brightness_sustain_lf}
      alt="Animation showing brightness/sustain loop filter frequency response"
    />
    <Image
      src={chapter_9_waveguide_pluck}
      alt="Animation showing the traveling wave components with an initial pluck shape with damping"
    />
    <Image
      src={chapter_9_pick_excitation}
      alt="Animation showing the traveling wave components of a string being struck by a simulated pick up and down"
    />
    <Python>{`out = np.zeros(fs * 10)
waveguide = WaveguideWithExcitation(length_samples=length_samples,
                                    pickup_sample=length_samples//6,
                                    excitation_sample=length_samples//4,
                                    excitation_type=WaveguideWithExcitation.ExcitationType.hammer,
                                    excitation_mass=80.0)
for i in range(out.size):
    if i < fs * 5 and i % (fs // 6) == 0: # every 6th of a second starting at t=0, trigger again
        waveguide.trigger(np.random.rand())
    out[i] = waveguide.tick()
Audio(out, rate=fs)`}</Python>
    <Audio src={guitar_pick} />
    <Python>{`from scipy.signal import convolve
string_indices = np.concatenate([np.arange(6), np.arange(6)[::-1]])
strum = guitar_with_coupling.strum(string_indices=string_indices, num_samples=fs*12)
strum_with_body = convolve(strum, ir_samples)

Audio(strum_with_body, rate=fs)`}</Python>
    <Audio src={guitar_strum} />
    <h4>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_9_virtual_musical_instruments_part_2.ipynb">
        Part 2: Piano Synthesis
      </Link>
    </h4>
    <Python>{`frequencies_and_amplitudes = [(frequency_for_note_label(note_label), 0.9) for note_label in ['A1', 'C3', 'D4', 'G6']]
plot_hammer_pulses_and_gains(frequencies_and_amplitudes, title='Hammer Pulses for Varying String Frequency')`}</Python>
    <Image src={hammer_pulses} alt="Piano hammer pulses for varying string frequency" />
    <Python>{`fundamental_frequency = note2freq('D4')
# higher \`nfft\` to get frequency bins with better alignment to exact harmonics
harmonic_frequencies = fundamental_frequency*np.arange(1, 13)
F, T, B_edr = plot_edr(d4, fs_d4, nfft=5096, harmonic_frequencies=harmonic_frequencies)`}</Python>
    <Image src={piano_edr} alt="3D Normalized energy decay relief" />
    <Python>{`create_dispersion_filter_animation()`}</Python>
    <Image
      src={chapter_9_dispersion}
      alt="Animation showing the changing phase response of a piano dispersion filter for different string frequencies"
    />
    <Python>{`arpeggiate(note_frequencies, onset_samples,
brightness=0.8,
model_hammer=False,
model_strike_position=False,
dispersion_filter_fn=piano_dispersion_filter)
Audio(out_samples, rate=fs)`}</Python>
    <Audio src={piano_arpeggio} />
    <Python>{`Audio(piano_striking_single_key, rate=fs)`}</Python>
    <Audio src={piano_single_key} />
    <h4>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/physical_audio_signal_processing/chapter_9_virtual_musical_instruments_part_3.ipynb">
        Part 3: Woodwinds
      </Link>
    </h4>
    <Image src={clarinet_chain} alt="Samples for each step in a chain of processors producing a clarinet-like sound" />
    <Python>{`clarinet = Clarinet()
clarinet.set_reed_stiffness(0.65)
clarinet.set_noise_gain(0.3)
clarinet.set_vibrato_gain(0.025)

note_frequencies = notes2freqs(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'])
note_index = 0
for i in range(out_samples.size):
    if np.isin(i, note_on_samples):
        amplitude = np.random.uniform(low=0.7, high=1.0)
        clarinet.note_on(note_frequencies[note_index], amplitude)
        note_index += 1
    elif np.isin(i, note_off_samples):
        clarinet.note_off(0.008)
    out_samples[i] = clarinet.tick()

Audio(out_samples, rate=fs)`}</Python>
    <Audio src={clarinet} />
    <br />
    <br />
    <p>Please email or open an issue on GitHub with questions, corrections and comments!</p>
  </div>
)
