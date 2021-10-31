import React from 'react'

import Link from '../Link'
import Image from '../Image'
import Audio from '../Audio'
import Video from '../Video'
import { Python } from '../CodeBlock'

import band_limited_noise_image from './assets/musimathics/volume_1/band_limited_noise.png'
import band_limited_noise from './assets/musimathics/volume_1/band_limited_noise.wav'
import diffraction_pattern from './assets/musimathics/volume_1/diffraction_pattern.mp4'
import equal_tempered from './assets/musimathics/volume_1/equal_tempered.wav'
import harmonic_circular_motion from './assets/musimathics/volume_1/harmonic_circular_motion.mp4'
import just_intervals_by_dissonance from './assets/musimathics/volume_1/just_intervals_by_dissonance.wav'
import membrane_modes from './assets/musimathics/volume_1/membrane_modes.mp4'
import oh_susanna_markov from './assets/musimathics/volume_1/oh_susanna_markov.wav'
import perfect_3rd_and_5th from './assets/musimathics/volume_1/perfect_3rd_and_5th.wav'
import proximity_effect from './assets/musimathics/volume_1/proximity_effect.mp4'
import voss_noise from './assets/musimathics/volume_1/voss_noise.wav'
import voss_noise_x2_rate from './assets/musimathics/volume_1/voss_noise_x2_rate.wav'
import voss_power_spectrum from './assets/musimathics/volume_1/voss_power_spectrum.png'
import weierstass_function from './assets/musimathics/volume_1/weierstass_function.mp4'

export default (
  <div>
    <p>
      I just finished reading <Link href="http://musimathics.com/">Musimathics Volume 1</Link> , and I want to share a
      set of{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/index.ipynb">
        Jupyter notebooks
      </Link>{' '}
      <small>
        (<Link href="https://github.com/khiner/notebooks/tree/master/musimathics/volume_1/">raw Github link</Link>)
      </small>{' '}
      I made along the way! There are notebooks for chapters 3-9 (the first two chapters are a relatively simple primer
      on audio fundamentals). They contain demonstrations, visualizations and extensions of some of the materials in the
      book that caught my interest along the way.
    </p>
    <p>
      I had a lot of fun reading and engaging with this first volume, and I am excited to dig into the second. It covers
      an incredibly diverse range of material, from acoustical physics to phychoacoustics to algorithmic composition
      strategies. Given the ambitions breadth of this book, you are bound to discover more than a few fascinating things
      you've never encountered before, regardless of your background.
    </p>
    <h2>About these notebooks</h2>
    <p>
      Much of the material in these notebooks is self-explanatory, and all of it can be enjoyed without reading the
      book. However, I make no strong effort to give much explanation inline, since the author has already done that
      hard work so well! As such, I hope that people who have read or are reading the book consider these interactive
      sketches as a small set of companion materials to enhance its contents. I encourage you to take some of the ideas
      and implementations and run with them to deepen your understanding!
    </p>
    <p>Here is a sample of the material in each chapter. There's much more to explore in the linked notebooks.</p>
    <h2>A sample of topics</h2>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_3_musical_scales_tuning_and_intonation.ipynb">
        Chapter 3: Musical Scales, Tuning, and Intonation
      </Link>
    </h3>
    <p>
      This chapter is about tuning systems, scales and their history. In the notebook, among other things, you will find
      pretty much all of the scales mentioned in the book.
    </p>
    <p>
      Hear the difference between the sound of a major triad in an equal-tempered scale and compare it to the same triad
      using pure Pythagorean ratios:
    </p>
    <p>
      <strong>Equal-tempered intervals:</strong>
      <Python>{`render_notes_ipython([(semitones_above_reference(c_3_hertz, semitone), 5)] for semitone in [0, 4, 7])`}</Python>
      <Audio src={equal_tempered} />
    </p>
    <p>
      <strong>With the perfect 3rd and 5th intervals:</strong>
      <Python>{`render_notes_ipython([(c_3_hertz * ratio, 5)] for ratio in [1, 5/4, 3/2])`}</Python>
      <Audio src={perfect_3rd_and_5th} />
    </p>
    <p>
      Hear the "just intervals" ordered by decreasing consonance (increasing dissonance) based on the conventions of
      Western music theory:
      <Python>{`# perfect intervals
unison = 1/1
octave = 2/1
fifth = 3/2
fourth = 4/3

# imperfect intervals
major_sixth = 5/3
major_third = 5/4
minor_third = 6/5
minor_sixth = 8/5

# dissonant intervals
major_second = 9/8
major_seventh = 15/8
minor_seventh = 16/9
minor_second = 16/15
tritone = 64/45

just_ratios_by_consonance = [unison, octave, fifth, fourth, major_sixth, major_third, minor_third, minor_sixth, major_second, major_seventh, minor_seventh, minor_second, tritone]

render_notes_ipython([[(c_3_hertz, 2)] * len(just_ratios_by_consonance), [(c_3_hertz * just_ratio, 2) for just_ratio in just_ratios_by_consonance]])`}</Python>
    </p>
    <Audio src={just_intervals_by_dissonance} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_4_physical_basis_of_sound.ipynb">
        Chapter 4: Physical Basis of Sound
      </Link>
    </h3>
    <p>
      This model shows the physical mechanisms behind the "Proximity Effect", which is the reason why voices closer to a
      microphone sound deeper than when they're farther away.
    </p>
    <Video src={proximity_effect} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_5_geometrical_basis_of_sound.ipynb">
        Chapter 5: Geometrical Basis of Sound
      </Link>
    </h3>
    <p>This chapter is mostly about the geometry of sinusoids and simple harmonic motion.</p>
    <Video src={harmonic_circular_motion} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_6_psychophysical_basis_of_sound.ipynb">
        Chapter 6: Psychophysical Basis of Sound
      </Link>
    </h3>
    <p>
      This chapter is all about how our physical hearing mechanisms and perceptual consciousness affect the way we
      subjectively hear audio, and how those perceptions are often not directly reflective of the physical properties of
      the audio phenomena being perceived.
    </p>
    <p>
      For example, our perception of <i>loudness</i> is affected by a kind of <i>chunkiness</i> of the basilar membrane,
      which is composed of sections that tend to resonate together. This has the effect of breaking up frequencies into
      perceived ranges - the "critical bands". In the following demonstration, a band-limited noise generator is first
      restricted to a narrow frequency range, and then its bandwidth is widened in discrete steps. The <i>energy</i> of
      the signal remains constant (the area within the rectangles shown below), but you will likely perceive it as
      getting louder as the bandwidth extends into different critical bands. This is one of the phenomena used by MP3
      encoding to compress audio!
    </p>
    <Python>{`from generators import band_limited_noise

band_center_hz = 1_000
band_widths_hz = [32 + 2 ** i for i in range(3, 12)]
# The last band width is not really symmetric since anything below ~28hz will not contribute to the perceived power, but since this last band bump still ~close~ to doubles the number of new frequencies, its perceived loudness will still increase roughly proportionally.

print(band_widths_hz)
band_limited_white_noise_signals = [band_limited_noise(band_center_hz - band_width_hz / 2, band_center_hz + band_width_hz / 2, SAMPLES_PER_SECOND * 2) for band_width_hz in band_widths_hz]
from scipy.signal import periodogram

for noise_signal in band_limited_white_noise_signals:
    f, Pxx_den = periodogram(noise_signal, SAMPLES_PER_SECOND)
    plt.semilogy(f, Pxx_den)
    plt.xlabel('frequency [Hz]')
    plt.xlim([band_center_hz - max(band_widths_hz) / 2 - 10, band_center_hz + max(band_widths_hz) / 2 + 10])
    plt.ylim([1e-9, 1e-6])
    plt.ylabel('PSD [V**2/Hz]')

# prevent clicks (TODO use AR)
ramp_samples = int(SAMPLES_PER_SECOND * 0.025)
for noise_signal in band_limited_white_noise_signals:
    noise_signal[:ramp_samples] *= np.linspace(0, 1, ramp_samples)
    noise_signal[-ramp_samples:] *= np.linspace(1, 0, ramp_samples)

render_samples_ipython(np.concatenate([noise_signal for noise_signal in band_limited_white_noise_signals]))`}</Python>
    <Audio src={band_limited_noise} />
    <Image src={band_limited_noise_image} alt="band limited noise" style={{ maxWidth: '550px' }} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_7_introduction_to_acoustics.ipynb">
        Chapter 7: Introduction to Acoustics
      </Link>
    </h3>
    <p>
      In this chapter, the author explores how audio waves behave in a physical environment. Among the many things
      covered is the mathematics of audio diffraction patterns:
    </p>
    <Video src={diffraction_pattern} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_8_vibrating_systems.ipynb">
        Chapter 8: Vibrating Systems
      </Link>
    </h3>
    <p>
      The only thing I implemented from this chapter is a model of the modes of vibration of a stretched membrane (like
      a drum head):
    </p>
    <Video src={membrane_modes} />
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_1/chapter_9_composition_and_methodology.ipynb">
        Chapter 9: Composition and Methodology
      </Link>
    </h3>
    <p>
      This chapter has the most content by far. It is all about perspectives, methodologies and algorithms for
      computer-generated/aided composition.
    </p>
    <p>
      Here is an animation you'll find in the notebook showing the behavior of the Weierstass Function, and its power
      spectrum.
    </p>
    <Video src={weierstass_function} />
    <p>
      The author uses this function to motivate the discussion of self-similarity and fractal structure in musical
      audio. These concepts are incorporated into the development of a fractal noise generator that sounds roughly the
      same at all sample rates!
    </p>
    <Python>{`voss_power_spectrum = np.abs(np.fft.fft(voss_noise)) ** 2
plt.loglog(voss_power_spectrum[:voss_power_spectrum.size // 2])
plt.plot(voss_power_spectrum.max()/(np.arange(1, voss_power_spectrum.size // 2)), label="$1/f$")
plt.title('Voss fractal noise power spectrum')
plt.legend()`}</Python>
    <Image src={voss_power_spectrum} alt="band limited noise" style={{ maxWidth: '550px' }} />
    <Python>{`render_samples_ipython(AR(0.2, 0.125).apply(voss_noise.copy()[:voss_noise.size // 4]), rate=SAMPLES_PER_SECOND)`}</Python>
    <Audio src={voss_noise} />
    <Python>{`render_samples_ipython(AR(0.4, 0.25).apply(voss_noise.copy()[:voss_noise.size // 2]), rate=SAMPLES_PER_SECOND * 2)`}</Python>
    <Audio src={voss_noise_x2_rate} />
    <br />
    <br />
    <p>As a final sample, here's a (first-order) Markov-generated remix of Oh Susannah!</p>
    <Python>{`render_notes_ipython(list(zip(first_order_markov_pitches, oh_susanna_rhythm)))`}</Python>
    <Audio src={oh_susanna_markov} />
    <br />
    <br />
    <p>
      If you find any mistakes, or if you get inspired and improve or expand on some of these concepts, please email me
      directly or open an issue on GitHub!
    </p>
  </div>
)
