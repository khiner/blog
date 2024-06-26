import Link from 'components/Link'
import Image from 'components/Image'

import windowing_animation from './assets/windowing_animation.gif'
import varying_dft_points_animation from './assets/varying_dft_points_animation.gif'
import varying_window_size_animation from './assets/varying_window_size_animation.gif'

export default (
  <div>
    <p>
      <i>
        Update: A newer post of mine,{' '}
        <Link href="https://karlhiner.com/jupyter_notebooks/mathematics_of_the_dft">Mathematics of the DFT</Link>, is a
        much more comprehensive look at the DFT.
      </i>
    </p>
    <p>
      <Link href="https://colab.research.google.com/github/khiner/notebooks/blob/master/dft-timeseries/DftTimeseries.ipynb">
        DFT for Timeseries Data
      </Link>{' '}
      is a Jupyter Notebook I developed for a presentation on applying the DFT to timeseries data for seasonality
      detection. The notebook attempts to build understanding one step at a time from a direct mathematical
      implementation and explanation of the DFT, to implementing frequency magnitude detection and approximate
      resynthesis.
    </p>
    <p>
      <i>
        <b>Note: </b>
        Being that this was designed to go along with a presentation, I would not recommend it as a first introduction
        to the DFT since it's really mostly code with some images for visual explanation.
      </i>{' '}
      Armed with some knowledge of the DFT already, I think it should help clarify some behaviors visually and could
      serve an implementation reference for some algorithms. I'm going to be digging into{' '}
      <Link href="https://www.amazon.com/Mathematics-Discrete-Fourier-Transform-DFT/dp/097456074X">
        Julius O. Smith's <i>Mathematics of the Discrete Fourier Transform</i>
      </Link>{' '}
      soon, so there should be more DFT-related notebooks to come!
    </p>
    <p>Here are some of the animations built up in this notebook:</p>
    <ul>
      <li>
        <p>
          <i>Increasing the number of DFT points results in better reconstruction of the original series:</i>
        </p>
        <Image src={varying_dft_points_animation} alt="Animation varying the number of DFT points" />
      </li>
      <li>
        <p>
          <i>The effects of windowing a pure sinusoid when the window is not an exact multiple of the period:</i>
        </p>
        <Image src={windowing_animation} alt="Animation of windowing's affect on the DFT with pure sinusoids" />
      </li>
      <li>
        <p>
          <i>The effect of window size on frequency magnitude accuracy:</i>
        </p>
        <Image
          src={varying_window_size_animation}
          alt="Animation of the effect of window size on frequency magnitude accuracy"
        />
      </li>
    </ul>
  </div>
)
