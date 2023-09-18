import React from 'react'

import { Python } from '../CodeBlock'
import Image from '../Image'
import Link from '../Link'

import conv_adsr from './assets/mathematics_of_the_dft/conv_adsr.gif'
import conv_matched_filter from './assets/mathematics_of_the_dft/conv_matched_filter.gif'
import conv_smooth_rect from './assets/mathematics_of_the_dft/conv_smooth_rect.gif'

import conv_conj_reverse_1 from './assets/mathematics_of_the_dft/conv_conj_reverse_1.png'
import conv_conj_reverse_10 from './assets/mathematics_of_the_dft/conv_conj_reverse_10.png'
import conv_conj_reverse_11 from './assets/mathematics_of_the_dft/conv_conj_reverse_11.png'
import conv_conj_reverse_12 from './assets/mathematics_of_the_dft/conv_conj_reverse_12.png'
import conv_conj_reverse_2 from './assets/mathematics_of_the_dft/conv_conj_reverse_2.png'
import conv_conj_reverse_3 from './assets/mathematics_of_the_dft/conv_conj_reverse_3.png'
import conv_conj_reverse_4 from './assets/mathematics_of_the_dft/conv_conj_reverse_4.png'
import conv_conj_reverse_5 from './assets/mathematics_of_the_dft/conv_conj_reverse_5.png'
import conv_conj_reverse_6 from './assets/mathematics_of_the_dft/conv_conj_reverse_6.png'
import conv_conj_reverse_7 from './assets/mathematics_of_the_dft/conv_conj_reverse_7.png'
import conv_conj_reverse_8 from './assets/mathematics_of_the_dft/conv_conj_reverse_8.png'
import conv_conj_reverse_9 from './assets/mathematics_of_the_dft/conv_conj_reverse_9.png'
import conv_conv_1 from './assets/mathematics_of_the_dft/conv_conv_1.png'
import conv_conv_2 from './assets/mathematics_of_the_dft/conv_conv_2.png'
import conv_conv_3 from './assets/mathematics_of_the_dft/conv_conv_3.png'
import conv_conv_4 from './assets/mathematics_of_the_dft/conv_conv_4.png'
import conv_downsample_1 from './assets/mathematics_of_the_dft/conv_downsample_1.png'
import conv_downsample_2 from './assets/mathematics_of_the_dft/conv_downsample_2.png'
import conv_downsample_3 from './assets/mathematics_of_the_dft/conv_downsample_3.png'
import conv_dual_1 from './assets/mathematics_of_the_dft/conv_dual_1.png'
import conv_dual_2 from './assets/mathematics_of_the_dft/conv_dual_2.png'
import conv_linearity_1 from './assets/mathematics_of_the_dft/conv_linearity_1.png'
import conv_linearity_2 from './assets/mathematics_of_the_dft/conv_linearity_2.png'
import conv_linearity_3 from './assets/mathematics_of_the_dft/conv_linearity_3.png'
import conv_linearity_4 from './assets/mathematics_of_the_dft/conv_linearity_4.png'
import conv_periodic_interp_1 from './assets/mathematics_of_the_dft/conv_periodic_interp_1.png'
import conv_periodic_interp_2 from './assets/mathematics_of_the_dft/conv_periodic_interp_2.png'
import conv_periodic_interp_3 from './assets/mathematics_of_the_dft/conv_periodic_interp_3.png'
import conv_periodic_interp_4 from './assets/mathematics_of_the_dft/conv_periodic_interp_4.png'
import conv_periodic_interp_5 from './assets/mathematics_of_the_dft/conv_periodic_interp_5.png'
import conv_shift_1 from './assets/mathematics_of_the_dft/conv_shift_1.png'
import conv_shift_2 from './assets/mathematics_of_the_dft/conv_shift_2.png'
import conv_shift_3 from './assets/mathematics_of_the_dft/conv_shift_3.png'
import conv_stretch_repeat_1 from './assets/mathematics_of_the_dft/conv_stretch_repeat_1.png'
import conv_stretch_repeat_2 from './assets/mathematics_of_the_dft/conv_stretch_repeat_2.png'
import conv_stretch_repeat_3 from './assets/mathematics_of_the_dft/conv_stretch_repeat_3.png'
import conv_zero_pad_1 from './assets/mathematics_of_the_dft/conv_zero_pad_1.png'
import conv_zero_pad_2 from './assets/mathematics_of_the_dft/conv_zero_pad_2.png'

export default (
  <div>
    <p>
      Another set of{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/mathematics_of_the_dft/index.ipynb">
        Jupyter notebooks
      </Link>
      !{' '}
      <small>
        (<Link href="https://github.com/khiner/notebooks/blob/master/mathematics_of_the_dft/">raw Github link</Link>)
      </small>
    </p>
    <p>
      <Link href="https://www.amazon.com/Mathematics-Discrete-Fourier-Transform-DFT/dp/097456074X/">
        Mathematics of the Discrete Fourier Transform
      </Link>{' '}
      is the first in a series of four books about audio and music DSP written by Julius O. Smith III. It goes into
      great depth about the DFT, with an emphasis on audio applications. The author assumes very little knowledge up
      front and explains all notational conventions along the way. If you want to know about the DFT, this is the book
      to read!
    </p>
    <p>
      As usual, these Jupyter notebooks go through all the exercises in each of the chapters. A few here and there
      remain unfinished. I couldn't find any solutions or really any reproduction of the questions at all online, so
      there were a few I could not figure out.
    </p>
    <p>
      There are a fair number of extra charts and animations sprinkled throughout, and I try to reproduce claims and
      results where I felt the need to - most notably in the{' '}
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/mathematics_of_the_dft/chapter_7_fourier_theorems_for_the_dft.ipynb">
        <i>Fourier Theorems for the DFT</i>
      </Link>{' '}
      chapter, where all of the given time
      {'<=>'}
      frequency operational symmetries are visually proven with charts, and some convolution examples are animated.
      Since that is the most visually interesting section in these notebooks, and since it is a good culmination of the
      material presented in the book, I'm going to reproduce that section of the notebooks here.
    </p>
    <p>
      What the following charts show is a fascinating link between operations done in the time domains and operations in
      the frequency domain. When you see notation like{' '}
      <span style={{ margin: '1em 0' }}>{`$\\fbox{Op$(x) \\longleftrightarrow \\text{OtherOp}(X)$}$`} ,</span> it means
      that if we take the DFT of the left-hand side (some time-domain signal that had some operation performed on it),
      we will exactly get the right-hand side (the DFT of that signal with some potentially different operation
      performed on it).
    </p>
    <p>
      As a practical example, the convolution operation in the time domain corresponds to multiplication in the
      frequency domain. More concretely, this means that we can compute the convolution of two signals by first taking
      the DFT of both signals separately, multiplying the resulting spectra, and then taking the inverse-DFT of the
      result. Numpy, for example,{' '}
      <Link href="https://github.com/scipy/scipy/blob/v1.1.0/scipy/signal/signaltools.py#L666">
        uses the FFT to perform convolution if the array size is large enough
      </Link>
      .
    </p>
    <p>Here is most of that chapter's notebook, without exercises:</p>
    <h3>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/mathematics_of_the_dft/chapter_7_fourier_theorems_for_the_dft.ipynb">
        Chapter 7: Digital Signals and Sampling
      </Link>
    </h3>
    <h3 id="Signal-Operators">Signal Operators</h3>
    <h4 id="Flip-Operator">Flip Operator</h4>
    <p>
      We define the <em>flip operator</em> by {`$\\text{Flip}_n(x) \\triangleq x(-n)$`}, for all sample indices{' '}
      {`$n \\in \\mathbb{Z}$`}. By modulo indexing, $x(-n)$ is the same as $x(N - n)$. The {`$\\text{Flip}()$`} operator
      reverses the order of samples $1$ through $N - 1$ of a sequence, leaving sample $0$ alone.
    </p>
    <Python>
      {`def flip(x):
    return np.concatenate([[x[0]], x[-1:0:-1]])

flip(np.arange(5))
> array([0, 4, 3, 2, 1])`}
    </Python>
    <h4 id="Shift-Operator">Shift Operator</h4>
    <p>
      The <em>shift operator</em> is defined by{' '}
      {`$\\text{Shift}_{\\Delta, n}(x) \\triangleq x(n - \\Delta), \\Delta \\in \\mathbb{Z}$,`} and{' '}
      {`$Shift_\\Delta(x)$`} denotes the entire shifted signal.
    </p>
    <Python>
      {`def shift(x, delta):
    return np.roll(x, delta)`}
    </Python>
    <h3 id="Convolution">Convolution</h3>
    <p>
      The <em>convolution</em> of two signals $x$ and $y$ in {`$\\mathbb{C}^N$`} may be denoted {`$x \\circledast y$`}{' '}
      and defined by
      {`$(x \\circledast y)_n \\triangleq \\sum_\\limits{m=0}^\\limits{N - 1}{x(m)y(n-m)}$`}.
    </p>
    <Python>
      {`def convolve(x, y):
    x = np.asarray(x)
    y = np.asarray(y)
    flipped_y = flip(y)
    convolved = np.zeros(x.size + y.size - 1)
    if x.dtype == complex or y.dtype == complex:
        convolved = convolved.astype(complex)
    for n in range(convolved.size):
        convolved[n] = np.sum(x * shift(flipped_y, n))
    return convolved`}
    </Python>
    <h4 id="Convolution-Example-1:-Smoothing-a-Rectangular-Pulse">
      Convolution Example 1: Smoothing a Rectangular Pulse
    </h4>
    <Python>
      {`x = [0,0,0,0,1,1,1,1,1,1,0,0,0,0]
h = [1/3,1/3,1/3,0,0,0,0,0,0,0,0,0,0,0]
create_convolution_animation(x, h, title='Convolution: Smoothing a Rectangular Pulse')`}
    </Python>
    <Image src={conv_smooth_rect} alt="convolution animation showing smoothing of a rectangular pulse" />
    <h4 id="Convolution-Example-2:-ADSR-Envelope">Convolution Example 2: ADSR Envelope</h4>
    <Python>
      {`x = [1.5] * 10 + [1] * 10 + [0] * 20
h = np.exp(-np.arange(40))
create_convolution_animation(x, h, title='Convolution: ADSR Envelope')`}
    </Python>
    <Image src={conv_adsr} alt="convolution animation showing creation of an ADSR envelope" />
    <h4 id="Convolution-Example-3:-Matched-Filtering">Convolution Example 3: Matched Filtering</h4>
    <Python>
      {`x = [1,1,1,1,0,0,0,0]
h = flip(x)
create_convolution_animation(x, h, title='Convolution: Matched Filtering')`}
    </Python>
    <Image
      src={conv_matched_filter}
      alt="animation showing convolution of inverted filters leading to a triangle wave"
    />
    <p>
      See my notebook for{' '}
      <a href="https://colab.research.google.com/github/khiner/notebooks/blob/master/musimathics/volume_2/chapter_4_convolution.ipynb">
        Musimathics Ch3
      </a>{' '}
      for more animated examples of convolution.{' '}
      <em>
        (Note that the definition of convolution in this book is circular, whereas the implementation used in
        Musimathics is not. Thus the convolutions do not repeat in the Musimathics animations.{' '}
        <strong>Also note</strong> that the non-circular implementation is much more common. It is what numpy and scipy
        use, and it is the definition that makes the convolution Fourier theorems below hold.)
      </em>
    </p>
    <h3 id="Stretch-Operator">Stretch Operator</h3>
    <p>
      A <em>stretch by factor $L$</em> is defined by
    </p>
    <p>{`$\\text{Stretch}_{L,m}(x) \\triangleq \\begin{cases}\\begin{array}{ll}x(m/L), & m/L \\space\\text{an integer}\\\\0, & m/L \\space\\text{non-integer}\\end{array}\\end{cases}$.`}</p>
    <Python>{`def stretch(x, L):
    x = np.asarray(x)
    stretched = np.zeros(L * len(x))
    if x.dtype == complex:
        stretched = stretched.astype(complex)
    for m in range(stretched.size):
        if m % L == 0:
            stretched[m] = x[(m+1) // L]
    return stretched

stretch([4,1,2], 3)
> array([ 4.,  0.,  0.,  1.,  0.,  0.,  2.,  0.,  0.])`}</Python>
    <p>
      The stretch operator describes <em>upsampling</em> - increasing the sampling rate by an integer factor. A stretch
      by $K$ followed by lowpass filtering to the frequency band {`$\\omega \\in (-\\pi/K,\\pi/K)$`} implements{' '}
      <em>ideal bandlimited interpolation</em>.
    </p>
    <h3 id="Zero-Padding">Zero Padding</h3>
    <p>
      Definition:{' '}
      {`$\\text{ZeroPad}_{M,m}(x) \\triangleq \\begin{cases}\\begin{array}{ll}x(m), & |m| < N/2 \\space\\text{an integer}\\\\0, & \\space\\text{otherwise}\\end{array}\\end{cases}$`}
    </p>
    <Python>
      {`def zero_pad(x, M):
    return np.insert(x, (len(x) + 1) // 2, np.zeros(M - len(x)))

zero_pad([1,2,3,4,5], 10)
> array([1, 2, 3, 0, 0, 0, 0, 0, 4, 5])

zero_pad([1,2,3,0,0], 10)
> array([1, 2, 3, 0, 0, 0, 0, 0, 0, 0])`}
    </Python>

    <h3 id="Repeat-Operator">Repeat Operator</h3>
    <Python>
      {`def repeat(x, L):
    return np.hstack([x] * L)

repeat([0,2,1,4,3,1], 2)`}
    </Python>

    <h3 id="Down-sampling-Operator">Down-sampling Operator</h3>
    <p>
      <em>Down-sampling by $L$</em> (also called <em>decimation</em> by $L$) is defined for {`$x \\in \\mathbb{C}^N$`}{' '}
      as taking every {`$L_{th}$`} sample, starting with sample zero:
    </p>
    <p>{`$\\begin{align}
\\text{Downsample}_{L,m}(x) &\\triangleq x(mL),\\\\
m &= 0,1,2,...,M-1\\\\
N &= LM
\\end{align}$.`}</p>
    <Python>
      {`def downsample(x, L):
    return x[::L]

downsample(np.arange(10), 2)
> array([0, 2, 4, 6, 8])`}
    </Python>

    <h3 id="Alias-Operator">Alias Operator</h3>
    <p>
      The <em>aliasing operator</em> for $N$-sample signals {`$x \\in \\mathbb{C}^N$`} is defined by
    </p>
    <p>{`$\\begin{align}
\\text{Alias}_{L,m}(x) &\\triangleq \\sum_\\limits{l=0}^\\limits{L-1}x(m + lM),\\\\
m &= 0,1,2,...,M-1\\\\
N &= LM
\\end{align}$.`}</p>
    <Python>{`def alias(x, L):
    x = np.asarray(x)
    M = (x.size + 1) // L
    return x.reshape((L, M)).sum(axis=0)

x = np.arange(6)
alias(x, 2)
> array([3, 5, 7])

alias(x, 3)
> array([6, 9])`}</Python>

    <h3 id="Fourier-Theorems">Fourier Theorems</h3>
    <p>In the next section, I will show empirically that all of the theorems listed in the book hold.</p>
    <h3 id="Linearity">Linearity</h3>
    <p>
      <strong>Theorem:</strong> For any {`$x, y \\in \\mathbb{C}^N$ and $\\alpha, \\beta \\in \\mathbb{C}$`}, the DFT
      satisfies
    </p>
    <p>{`$\\fbox{$\\alpha x + \\beta y \\longleftrightarrow \\alpha X + \\beta Y$}$`}</p>
    <Python>
      {`x = np.cos(np.linspace(-2 * np.pi, 2 * np.pi * 4, 40, endpoint=False))
y = np.sin(np.linspace(-2 * np.pi, 2 * np.pi * 7, 40, endpoint=False))

X = plot_signal_and_fft(x, show=[1,2], signal_label='$x$')
Y = plot_signal_and_fft(y, show=[1,2], signal_label='$y$')

plot_signal_and_fft(2 * x + 3 * y, show=[1,2], signal_label='$2x + 3y$', spectrum_label='$DFT(2x + 3y)$')
plot_signal_and_fft(spectrum=2 * X + 3 * Y, show=[1,2], signal_label='$2x + 3y$', spectrum_label='$2X + 3Y$')`}
    </Python>
    <Image src={conv_linearity_1} alt="Convolution" />
    <Image src={conv_linearity_2} alt="Convolution" />
    <Image src={conv_linearity_3} alt="Convolution" />
    <Image src={conv_linearity_4} alt="Convolution" />

    <h3 id="Conjugation-and-Reversal">Conjugation and Reversal</h3>
    <p>
      <strong>Theorem:</strong> For any {`$x \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{$\\overline{x} \\longleftrightarrow $Flip$(\\overline{X})$}.$`}</p>
    <Python>{`x = np.exp(1j * np.linspace(-2 * np.pi, 2 * np.pi * 4, 40, endpoint=False))

X = plot_signal_and_fft(x, show=[1,2])
plot_signal_and_fft(np.conj(x), show=[1,2], signal_label='$\\bar{x}$', spectrum_label='$DFT(\\bar{x})$')
plot_signal_and_fft(x, show=[2], spectrum_operator=lambda X: flip(np.conj(X)), spectrum_label='Flip$(\\bar{X})$')`}</Python>
    <Image src={conv_conj_reverse_1} alt="Convolution" />
    <Image src={conv_conj_reverse_2} alt="Convolution" />
    <Image src={conv_conj_reverse_3} alt="Convolution" />

    <p>
      <strong>Theorem:</strong> For any {`$x \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{Flip$(\\overline{x}) \\longleftrightarrow \\overline{X}$}.$`}</p>
    <Python>{`plot_signal_and_fft(flip(np.conj(x)), show=[1,2], signal_label='Flip$(\\bar{x})$', spectrum_label='$DFT($Flip$(\\bar{x}))$')
plot_signal_and_fft(spectrum=X, show=[2], spectrum_operator=np.conj, spectrum_label='$\\bar{X}$')`}</Python>
    <Image src={conv_conj_reverse_4} alt="Convolution" />
    <Image src={conv_conj_reverse_5} alt="Convolution" />

    <p>
      <strong>Theorem:</strong> For any {`$x \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{Flip$(x) \\longleftrightarrow $ Flip$({X})$}.$`}</p>
    <Python>{`plot_signal_and_fft(flip(x), show=[1,2], signal_label='Flip$(x)$', spectrum_label='$DFT($Flip$(x))$')
plot_signal_and_fft(spectrum=flip(X), show=[1,2], spectrum_label='Flip$(X)$')`}</Python>
    <Image src={conv_conj_reverse_6} alt="Convolution" />
    <Image src={conv_conj_reverse_7} alt="Convolution" />

    <p>
      <strong>Corollary:</strong> For any {`$x \\in \\mathbb{R}^N$`},
    </p>
    <p>{`$\\fbox{Flip$(x) \\longleftrightarrow \\overline{X}$}.$`}</p>
    <Python>{`x = np.sin(np.linspace(-2 * np.pi, 2 * np.pi * 4, 40, endpoint=False))
X = plot_signal_and_fft(x, show=[1,3])
plot_signal_and_fft(flip(x), show=[1,3], signal_label='Flip$(x)$', spectrum_label='$DFT($Flip$(x))$')
plot_signal_and_fft(spectrum=np.conj(X), show=[3], spectrum_label='$\\\\bar{X}$')`}</Python>
    <Image src={conv_conj_reverse_8} alt="Convolution" />
    <Image src={conv_conj_reverse_9} alt="Convolution" />
    <Image src={conv_conj_reverse_10} alt="Convolution" />

    <p>
      <strong>Corollary:</strong> For any {`$x \\in \\mathbb{R}^N$`},
    </p>
    <p>{`$\\fbox{Flip$(X) \\longleftrightarrow \\overline{X}$}.$`}</p>
    <Image src={conv_conj_reverse_11} alt="Convolution" />
    <Image src={conv_conj_reverse_12} alt="Convolution" />

    <h3 id="Shift-Theorem">Shift Theorem</h3>
    <p>
      <strong>Theorem:</strong> For any {`$x \\in \\mathbb{C}^N$ and any integer $\\Delta$`},
    </p>
    <p>{`$\\fbox{$\\text{DFT}_{k}[\\text{Shift}_{\\Delta}(X)] = e^{-j\\omega_k\\Delta}X(k)$}.$`}</p>
    <p>The shift theorem is often expressed in shorthand as</p>
    <p>{`$\\fbox{$x(n-\\Delta) \\longleftrightarrow e^{-j\\omega_k\\Delta}X(\\omega_k)$}.$`}</p>
    <p>
      The shift theorem says that a <em>delay</em> in the time domain corresponds to a <em>linear phase term</em> in the
      frequency domain.
    </p>
    <Python>{`x = np.exp(1j * np.linspace(0, 2 * np.pi * 6, 40, endpoint=False))

delta = 10
X = plot_signal_and_fft(x)
plot_signal_and_fft(shift(x, delta), signal_label='Shift$_\\Delta(x)$', spectrum_label='$DFT($Shift$_\\Delta(x))$')
plot_signal_and_fft(spectrum=np.exp(-1j * 2 * np.pi * delta * np.arange(X.size) / X.size) * X, spectrum_label='$e^{-j\\omega_k\\Delta}X(\\omega_k)$')`}</Python>
    <Image src={conv_shift_1} alt="Convolution" />
    <Image src={conv_shift_2} alt="Convolution" />
    <Image src={conv_shift_3} alt="Convolution" />

    <h3 id="Convolution-Theorem">Convolution Theorem</h3>
    <p>
      <strong>Theorem:</strong> For any {`$x,y \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{$x \\circledast y \\longleftrightarrow X \\cdot Y$}.$`}</p>
    <p>
      <em>
        (Note that we need to zero-pad the signals to the convolution-length before taking their spectra for this to
        hold, in order to avoid getting spectra corresponding to circular convolution)
      </em>
      .
    </p>
    <Python>{`x = np.exp(1j * np.linspace(0, 2 * np.pi * 20, 128, endpoint=False))
y = np.exp(1j * np.linspace(0, 2 * np.pi * 36, 128, endpoint=False))

conv_size = x.size + y.size - 1
X = plot_signal_and_fft(zero_pad(x, conv_size), show=[1,2])
Y = plot_signal_and_fft(zero_pad(y, conv_size), show=[1,2], signal_label='y')
plot_signal_and_fft(np.convolve(x, y), show=[1,2], signal_label='$conv(x, y)$', spectrum_label='DFT$(conv(x, y))$')
plot_signal_and_fft(spectrum=X * Y, show=[2], spectrum_label='$X \\\\cdot Y$')`}</Python>
    <Image src={conv_conv_1} alt="Convolution" />
    <Image src={conv_conv_2} alt="Convolution" />
    <Image src={conv_conv_3} alt="Convolution" />
    <Image src={conv_conv_4} alt="Convolution" />

    <h3 id="Dual-of-the-Convolution-Theorem">Dual of the Convolution Theorem</h3>
    <p>
      The dual of the convolution theorem says that{' '}
      <em>multiplication in the time domain is convolution in the frequency domain</em>.
    </p>
    <p>
      <strong>Theorem:</strong>
    </p>
    <p>{`$\\fbox{$x \\cdot y \\longleftrightarrow \\frac{1}{N} X \\circledast Y$}.$`}</p>
    <Python>{`_ = plot_signal_and_fft(x * y, show=[1,3], signal_label = '$x * y$', spectrum_label='DFT$(x * y)$')
plot_signal_and_fft(spectrum=np.convolve(X, Y)[:x.size] / x.size, show=[3], spectrum_label='$\\\\frac{1}{N}conv(X, Y)$')`}</Python>
    <Image src={conv_dual_1} alt="Convolution" />
    <Image src={conv_dual_2} alt="Convolution" />

    <h3 id="Power-Theorem">Power Theorem</h3>
    <p>
      <strong>Theorem:</strong> For all {`$x,y \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{$\\langle x , y \\rangle = \\frac{1}{N}\\langle X , Y \\rangle$}.$`}</p>
    <Python>{`x = np.exp(1j * np.arange(100))
y = np.exp(1j * np.arange(100) * 2 * np.pi)
np.abs((x * np.conj(y)).sum())
> 0.54726924741583161

np.abs((np.fft.fft(x) * np.conj(np.fft.fft(y)))).sum() / x.size
> 0.54726924741635341`}</Python>
    <h3 id="Stretch-Theorem-(Repeat-Theorem)">Stretch Theorem (Repeat Theorem)</h3>
    <p>
      <strong>Theorem:</strong> For all {`$x \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{$\\text{Stretch}_L(x) \\longleftrightarrow \\text{Repeat}_L(X)$}.$`}</p>
    <p>
      That is, when you stretch a signal by the factor $L$ (inserting zeros between the original samples), its spectrum
      is repeated $L$ times around the unit circle.
    </p>
    <Python>{`x = np.exp(1j * np.linspace(0, 2 * np.pi * 20, 128, endpoint=False))

L = 3
X = plot_signal_and_fft(x, show=[1,2])
_ = plot_signal_and_fft(stretch(x, L), show=[1,2], signal_label='Stretch$_L(x)$', spectrum_label='DFT(Stretch$_L(x)$)')
_ = plot_signal_and_fft(spectrum=repeat(X, L), show=[1,2], spectrum_label='Repeat$_L(X)$')`}</Python>
    <Image src={conv_stretch_repeat_1} alt="Convolution" />
    <Image src={conv_stretch_repeat_2} alt="Convolution" />
    <Image src={conv_stretch_repeat_3} alt="Convolution" />

    <h3 id="Down-sampling-Theorem-(Aliasing-Theorem)">Down-sampling Theorem (Aliasing Theorem)</h3>
    <p>
      <strong>Theorem:</strong> For all {`$x \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{$\\text{Downsample}_L(x) \\longleftrightarrow \\frac{1}{L}\\text{Alias}_L(X)$}.$`}</p>
    <Python>{`L = 4
X = plot_signal_and_fft(x, show=[1,2])
plot_signal_and_fft(downsample(x, L), show=[1,2], signal_label='Stretch$_L(x)$)', spectrum_label='DFT(Stretch$_L(x)$)')
plot_signal_and_fft(spectrum=alias(X, L) / L, show=[1,2], spectrum_label='$\\\\frac{1}{L}$Alias$_L(X)$')`}</Python>
    <Image src={conv_downsample_1} alt="Convolution" />
    <Image src={conv_downsample_2} alt="Convolution" />
    <Image src={conv_downsample_3} alt="Convolution" />

    <h3 id="Zero-Padding-Theorem-(Spectral-Interpolation)">Zero Padding Theorem (Spectral Interpolation)</h3>
    <p>
      Zero padding in the time domain corresponds to <em>ideal interpolation in the frequency domain</em> (for
      time-limited signals):
    </p>
    <p>
      <strong>Theorem:</strong> For any {`$x \\in \\mathbb{C}^N$`},
    </p>
    <p>{`$\\fbox{$\\text{ZeroPad}_{LN}(x) \\longleftrightarrow \\text{Interp}_L(X)$}.$`}</p>
    <Python>{`x = np.exp(1j * np.linspace(0, 2 * np.pi * 4.4, 24, endpoint=False))
X = plot_signal_and_fft(x, show=[1,2])
plot_signal_and_fft(zero_pad(x, 100), show=[1,2], signal_label='ZeroPad$_L(x)$)', spectrum_label='DFT(ZeroPad$_L(x)$)')`}</Python>
    <Image src={conv_zero_pad_1} alt="Convolution" />
    <Image src={conv_zero_pad_2} alt="Convolution" />

    <h3 id="Periodic-Interpolation-(Spectral-Zero-Padding)">Periodic Interpolation (Spectral Zero Padding)</h3>
    <p>
      The dual of the zero-padding theorem states formally that <em>zero padding in the frequency domain</em>{' '}
      corresponds to <em>periodic interpolation</em> in the time domain:
    </p>
    <p>
      <strong>Definition:</strong> For all {`$x \\in \\mathbb{C}^N$ and any integer $L \\geq 1$`},
    </p>
    <p>{`$\\fbox{$\\text{PerInterp}(x) \\triangleq \\text{IDFT}(\\text{ZeroPad}_{LN}(X))$}.$`}</p>
    <Python>{`x = np.exp(1j * np.linspace(0, 2 * np.pi * 5, 24, endpoint=False))
X = plot_signal_and_fft(x, show=[1,2])

x_interp = np.fft.ifft(zero_pad(X, 100))
plot_signal_and_fft(x_interp, show=[1], signal_label='IDFT(ZeroPad$_{LN}((x))$')`}</Python>
    <Image src={conv_periodic_interp_1} alt="Convolution" />
    <Image src={conv_periodic_interp_2} alt="Convolution" />

    <p>
      <strong>Definition:</strong> For any {`$X \\in \\mathbb{C}^N$ and any odd integer $M < N$`} we define the{' '}
      <em>length M even rectangular windowing operation</em> by
    </p>
    <p>
      {`$\\text{Chop}_{M,k}(X) \\triangleq \\begin{cases}\\begin{array}{ll}X(k), & \\space-\\frac{M-1}{2} \\leq k \\leq \\frac{M-1}{2}\\\\0, & \\space\\frac{M+1}{2} \\leq \\left|k\\right| \\leq \\frac{N}{2}\\end{array}\\end{cases}$`}
      .
    </p>
    <p>
      <strong>Theorem:</strong> When {`$x \\in \\mathbb{C}^N$`} consists of one or more periods from a <em>periodic</em>{' '}
      signal {`$x^\\prime \\in \\mathbb{C}^\\infty$`},
    </p>
    <p>{`$\\fbox{$\\text{PerInterp}_{L}(x) \\longleftrightarrow \\text{IDFT}(\\text{Chop}_N(\\text{DFT}(\\text{Stretch}_L(x))))$}.$`}</p>
    <Python>{`def chop(X, M):
    X_chopped = np.zeros(X.size).astype(complex)
    X_chopped[-(M - 1) // 2:] = X[-(M - 1) // 2:]
    X_chopped[:(M - 1) // 2] = X[:(M - 1) // 2]
    return X_chopped

x = np.exp(1j * np.linspace(0, 2 * np.pi * 5, 24, endpoint=False))
X = plot_signal_and_fft(x, show=[1,2])

L = 4
x_stretch = stretch(x, L)
X_stretch = plot_signal_and_fft(x_stretch, show=[1,2], signal_label='Stretch$_L(x)$', spectrum_label='DFT(Stretch$_L(x)$)')

x_interp = np.fft.ifft(chop(X_stretch, x.size))
plot_signal_and_fft(x_interp, show=[1], signal_label='IDFT(Chop$_{N}($DFT$($Stretch$(x))))$')`}</Python>
    <Image src={conv_periodic_interp_3} alt="Convolution" />
    <Image src={conv_periodic_interp_4} alt="Convolution" />
    <Image src={conv_periodic_interp_5} alt="Convolution" />
  </div>
)
