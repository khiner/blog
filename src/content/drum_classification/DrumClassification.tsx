import Link from 'components/Link'
import Image from 'components/Image'

import preview_image from './assets/drum_classification.png'
import confusion_matrix from './assets/confusion_matrix.png'
import loss_plot from './assets/loss_plot.png'
import model_diagram from './assets/model_diagram.png'

export default (
  <div>
    <p>
      For my final project for Computational Data Analysis at Georgia Tech in Fall 2023, I created a drum classification
      model in PyTorch, trained on Magenta's{' '}
      <Link href="https://magenta.tensorflow.org/datasets/e-gmd">Expanded Groove MIDI Dataset</Link>.
    </p>
    <ul>
      <li>
        <Link href="https://github.com/khiner/DrumClassification">GitHub</Link> (includes model and training code,
        pretrained model and inference code, and dataset processing scripts)
      </li>
      <li>
        <Link href="https://github.com/khiner/DrumClassification/blob/main/Report.pdf">Paper</Link>
      </li>
      <li>
        <Link href="https://docs.google.com/presentation/d/1ufFL36nH9eNNpiOiuhE9WII_oXde6DfoOEaypKhZuWA/edit#slide=id.p">
          Slide deck
        </Link>
      </li>
      <li>
        <Link href="https://github.com/khiner/DrumClassification/blob/main/explore_dataset.ipynb">
          Dataset explorer notebook
        </Link>
      </li>
    </ul>
    <Image
      src={preview_image}
      alt="Graphic of a kick drum audio waveform going into a neural network and coming out as a drum classification"
    />
    <p>
      This course focused on the mathematical and PAC learning foundations of machine learning, so I favored model
      simplicity over classification accuracy. Overall, I was pleasantly surprised by the results, achieving 93.4%
      accuracy with a far-from-perfect dataset and a{' '}
      <Link href="https://github.com/khiner/DrumClassification/blob/main/model.py">
        straightforward model and preprocessing pipeline
      </Link>{' '}
      (no novel methods here!):
    </p>

    <Image src={model_diagram} alt="Diagram of drum classification model" />
    <Image src={loss_plot} alt="Plot of drum classification model validation and training loss curves" />
    <p>
      The distribution of misclassified samples (shown in the confusion matrix below, with actual labels on the left and
      predicted labels on the bottom) largely reflects perceptual similarity. For example, the model is least likely to
      mispredict a pedal hi-hat (a short burst of pitched metallic noise) as a bass drum (with a nearly sinusoidal,
      smoothly decaying curve), and it is most likely to mispredict a closed hi-hat (struck with a stick) as a pedal
      hi-hat (sounded when closing the hit-hat with a pedal). These failure modes are even more forgivable when
      considering each drum instrument class contains samples from many drum kit presets, many of which do not mimic
      acoustic sets.
    </p>
    <Image src={confusion_matrix} style={{ maxWidth: 600 }} alt="Confusion matrix of drum classification model" />
    <p>
      As usual, most of the work in this project was in the data preprocessing. Magenta's E-GMD is a dataset of human
      drum performances containing 444 hours of MIDI-annotated audio recordings collected from live drumming
      performances on a Roland TD-17 electronic drum kit across 43 presets. To simplify the model and analysis, I
      decided not to attempt multi-way classification of overlapping drum instrument hits, so I implemented simple
      heuristics (detailed in section 3.1 of{' '}
      <Link href="https://github.com/khiner/DrumClassification/blob/main/Report.pdf">the paper</Link> and implemented in
      the scripts described in the{' '}
      <Link href="https://github.com/khiner/DrumClassification/blob/main/README.md#prepare-data-for-training">
        Prepare data for training
      </Link>{' '}
      section of the Readme) to process the MIDI and audio to estimate audio segments containing only a single, complete
      drum instrument sound. The resulting "chopped" dataset includes many poorly segmented samples, including
      overlapping hits, missing or delayed onsets, and an occasional mislabelled sample. Poor segmentation is primarily
      due to the nature of the MIDI data - the drum MIDI data only provides <i>onset</i> ticks with the corresponding
      audio extending over an unknown duration. The dataset also includes several sessions with MIDI events misaligned
      from the audio clips a good bit more than the advertised 2ms alignment accuracy. Even so, there are gains to be
      made by improving the heuristics for finding clean single-instrument hits.
    </p>
    <p>
      If your goal is to achieve good classification performance, a more sane approach would be downloading a variety of
      pre-labelled drum sample packs. However, the MIDI-annotated audio dataset used here is more representative of
      real-world drum performances, which opens up many learning possibilities, including incorporating velocity
      information into a classification model, learning drum humanization models for MIDI, or even for generative drum
      synthesis (MIDI2Audio) models. A big thank you to the Magenta team for putting in all the hard work to create the
      fantastic E-GMD dataset! For more details, see the GitHub, paper, dataset explorer notebook, and slide deck.
    </p>
  </div>
)
