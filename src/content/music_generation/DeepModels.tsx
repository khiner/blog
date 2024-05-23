import CodeBlock from '../CodeBlock'
import Link from 'components/Link'
import SoundCloudLink from '../SoundCloudLink'

import samplernn_diagram from './assets/samplernn_diagram.png'

export default (
  <div>
    <p>
      Most raw audio generation papers focus on speech. If musical audio samples are published, they're usually the
      result of training on simple single-instrument recordings. My goal with this post is to share some unscientific
      experiments in training a few popular deep neural network models to generate more complex and musically
      interesting audio. I also hope to convey a rough sense of how these tools compare in terms of their generation
      quality, as well as their training and sampling time.
    </p>
    <p>
      While there are a ton of papers and resources discussing audio generation models from a theoretical perspective, I
      haven't found many resources for musicians or enthusiasts who just want to get some musically interesting results.
    </p>
    <p>
      These models take a lot of time to train, and in some cases take a long time to sample from. Since I'm running
      everything locally on a single GPU in my spare time, I haven't done nearly as much experimentation as I'd like.
      I've done basically no hyperparameter tuning, using mostly default settings. In some cases I think more training
      time or larger datasets could have helped the end result.
    </p>
    <p>
      As such, the results here don't represent what's <i>possible</i>, but rather are just a few data points that
      should be thought of as baselines. Some results I think sound great, and some sound bad, noisy, crackly, or just
      silly. I think both kinds of results have merit for music production. "Failure" cases, in addition to sometimes
      sounding really interesting, can help in gaining some intuition around how these models work from a practical
      perspective.
    </p>

    <h2>WaveNet</h2>

    <h3>Model Summary</h3>

    <p>
      <Link href="https://arxiv.org/abs/1609.03499v2">WaveNet</Link> is without a doubt the most popular deep neural
      audio generation model. It's an autoregressive model, meaning that each sample is generated by estimating the most
      likely value given the past samples. It's used widely in text-to-speech implementations as a vocoder to translate
      learned low-dimensional time-frequency representations into natural sounding high-fidelity audio samples. However,
      it can be trained and sampled from unconditionally (without any text or linguistic features) to generate audio
      that sounds similar to the training set. It can only model dependencies across a finite time context determined by
      the receptive field of its final layer (read{' '}
      <Link href="https://deepmind.com/blog/wavenet-generative-model-raw-audio/">DeepMind's original blog post</Link>{' '}
      for more details). This finite context means the model can only capture patterns over relatively short timescales
      (say, around a second).
    </p>
    <p>
      For speech generation, this means unconditional sampling generates a kind of incoherent babbling (examples are
      from DeepMind):
      <br />
      <audio
        src="https://storage.googleapis.com/deepmind-media/pixie/knowing-what-to-say/first-list/speaker-1.wav"
        controls="controls"
      />
      <br />
    </p>
    <p>
      For music, the results are only coherent over a few notes, but the timbral characteristics are well modeled:
      <br />
      <audio src="https://storage.googleapis.com/deepmind-media/pixie/making-music/sample_2.wav" controls="controls" />
    </p>
    <p>
      In my experiments, I don't achieve this level of quality. This is partially because the complexity of the training
      audio is stretching the limits of the model, and probably to a larger extent due to smaller model sizes, less
      training time and smaller datasets.
    </p>
    <h3>Results</h3>

    <p>
      I trained <Link href="https://github.com/ibab/tensorflow-wavenet">this Tensorflow implementation of WaveNet</Link>{' '}
      on the album, <Link href="https://youtu.be/zH4lkK-vSco">"Dysnomia" by Dawn of Midi</Link>, split into 8 second
      chunks, converted to mono and downsampled to 16kHz. All of the code, training data and pretrained models for these
      results can be found in <Link href="https://github.com/khiner/tensorflow-wavenet">this fork</Link>.
    </p>
    <p>
      I trained for the default limit 100k steps, which took about 14 hours on a single 2080 Ti graphics card. Sampling
      took about a minute per second of audio. This first attempt generated the following:
    </p>
    <SoundCloudLink trackId="657682778" />
    <SoundCloudLink trackId="657682784" />
    <p>Here are the full instructions for setting up, training and generating the above samples:</p>
    <CodeBlock language="shell">
      {`$ git clone git@github.com:khiner/tensorflow-wavenet.git
$ cd tensorflow-wavenet
$ conda create -n tensorflow-wavenet python=3.6.8 anaconda
$ conda activate tensorflow-wavenet
$ pip install -r requirements_gpu.txt
$ python train.py --data_dir=datasets/dawn_of_midi
$ python generate.py --wav_out_path=generated/ dom-defaultmodel-100ksteps-640000samples.wav --samples 640000 logdir/train/2019-06-29T08-58-25/model.ckpt-99800`}
    </CodeBlock>
    <p>
      I was pleasantly surprised at the quality of this sample! It's rambly with almost no melodic movement or
      structure, but rhythmically it has an intuitive, playful free jazz feel.
    </p>
    <p>
      I also tried training on a different album,{' '}
      <Link href="https://youtu.be/lUCA1w8g8L0">"Give" by The Bad Plus</Link>, using a similar training procedure.
      However, I didn't have as much luck with the results. Here's an example:
    </p>
    <SoundCloudLink trackId="657682808" />
    <p>
      I noticed in the logs that the code was automatically ignoring a lot of clips since it thought - sometimes
      incorrectly - they were full of only silence. I tried again without trimming or ignoring any silence, letting it
      try to learn the distribution of both low- and high-amplitude audio:
    </p>
    <CodeBlock language="shell">
      {`$ python train.py --data_dir=datasets/bad_plus_give_8s --silence_threshold=0
$ python generate.py --wav_out_path=generated-bad-plus-give-with-silence-64000.wav --samples 64000 logdir/train/2019-07-07T15-54-50/model.ckpt-99950`}
    </CodeBlock>
    <p>The short result seemed pretty similar:</p>
    <SoundCloudLink trackId="657682802" />
    <p>
      Since there's a much wider diversity of sounds in this album, I thought it would help to train for an additional
      100k steps:
    </p>
    <CodeBlock language="shell">
      {`$ python train.py --restore_from=logdir/train/2019-07-07T15-54-50/ --data_dir=datasets/bad_plus_give_8s --silence_threshold=0
$ python generate.py --wav_out_path=generated-bad-plus-give-with-silence-200ksteps-64000.wav --samples 64000 logdir/train/2019-07-08T21-30-12/model.ckpt-99900`}
    </CodeBlock>
    <SoundCloudLink trackId="657682793" />
    <p>And here's a longer example (although it's not terribly interesting!)</p>
    <SoundCloudLink trackId="657682787" />
    <p>
      It seems to get easily stuck in a single mode with lots of high frequencies that sound like they were learned from
      the noisy ride and crash cymbals, with a clear kick and snare washed in, but with almost no clearly pitched
      components. My intuition is that a lot of the capacity is being allocated to the impossible task of modeling the
      local distribution of the percussion, which closely approximates white-noise in the case of cymbals (applied
      generously in the training set).
    </p>
    <p>
      One thing that has been known to improve generation quality for autoregressive models (introduced by Alex Graves
      for improved handwriting generation in his paper,{' '}
      <Link href="https://arxiv.org/abs/1308.0850v5">
        <i>Generating Sequences with Recurrent Neural Networks</i>
      </Link>
      ) is to "prime" the generation with a sequence of values from the test distribution. WaveNet isn't a recurrent
      network like the ones Graves was working with, but the same principal still works. It forces the first generated
      values to be realistic ones, seeding the model so that when it predicts future samples, it is encouraged to
      continue where the seed left off. However, given the small receptive field size of the model (about 320ms), and
      given its clearly poor understanding of the noisy and complex training set, basically all of this influence is
      lost after generation advances past its receptive field size. You can hear this in the following seeded clip - the
      first third of a second (again, the receptive field size) is the seed clip. In short order it goes right back to
      being crappy:
    </p>
    <SoundCloudLink trackId="657682796" />
    <p>
      To address this, I followed some advice in{' '}
      <Link href="https://github.com/ibab/tensorflow-wavenet/issues/47">this issue thread</Link> and simply increased
      the receptive field by adding more dilation layers. Specifically, I settled on a config with a{' '}
      <code>dilations</code> argument of:
    </p>
    <CodeBlock language="json">
      {`"dilations": [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1014, 2048,
              1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
              1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
              1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
              1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048,
              1, 2, 4, 8, 16, 32, 64]`}
    </CodeBlock>
    <p>
      and the rest of the parameters unaltered from the defaults. This change increases the total receptive field
      dramatically to about 1.3 seconds.
    </p>
    <p>This is what it came up with (the training and generation commands were identical to the above):</p>
    <SoundCloudLink trackId="657682826" />
    <p>
      The results are still pretty cacophonous, but there are some transition points, some brief pauses, and some
      pitched tones and squeaks! Also, to my ears, the percussive wash sounds a little more like a jam by Animal from
      the Muppets, rather than just a continuous swell of textured white noise. Definitely an improvement.
    </p>
    <p>
      Training for another 100k steps produced a model with more of an appreciation for space (although about halfway
      through it remembers how much it loves to just pummel that drum kit):
    </p>
    <SoundCloudLink trackId="657682820" />
    <p>And generating with the same model once more makes it clear that this drum sound-wall is still a common mode:</p>
    <SoundCloudLink trackId="657682817" />
    <p>
      Overall, I like the results in these last two clips. There are parts that sound pretty fluid and expressive, with
      clear individual snare hits, some timbral shifts and satisfying low rumbles.
    </p>
    <p>
      I also went back and applied this improved model to the Dawn of Midi dataset. The results are a bit more
      structured and varied, with more consistency in tempo. However, they also get stuck in some noisy modes sometimes
      (exemplified in the last example). Without further commentary, here are some results:
    </p>
    <SoundCloudLink trackId="657682754" />
    <SoundCloudLink trackId="657682742" />
    <SoundCloudLink trackId="657682736" />
    <SoundCloudLink trackId="657682724" />
    <h2>SampleRNN</h2>

    <h3>Model Summary</h3>

    <p>
      <Link href="https://arxiv.org/abs/1612.07837">SampleRNN</Link> is another very popular audio generation model.
      Unlike WaveNet, SampleRNN is a recurrent model. Recurrent cells like <Link href="">LSTMs</Link> or{' '}
      <Link href="">GRUs</Link> can theoretically propagate useful information over arbitrarily long time horizons. In
      practice, however, LSTMs usually have a hard time learning latent patterns over long time scales. In part this is
      due to issues like vanishing or exploding gradients. But it is also because of the sheer difficulty of discovering
      these patterns using a relatively small bank of recurrent memory cells and learned update rules. The main insight
      behind SampleRNN is that audio in particular exhibits salient patterns at multiple timescales, and that these
      patterns and features are composed hierarchically. For example, timbre is shaped by patterns over very short
      timescales, while musical events and gestures like bowing or striking an instrument happen over longer timescales.
      Melodies are composed of a series of musical events, which are often grouped into compositional structures like
      bars or phrases, which are further grouped into sections and then full songs.
    </p>
    <p>
      SampleRNN eases the discovery of these hierarchical timeseries features by imposing a similarly hierarchical
      network architecture.
    </p>
    <img src={samplernn_diagram} style={{ width: '80%' }} alt="Diagram of SampleRNN showing RNN cell hierarchy" />
    <p>
      RNN memory cells are organized into tiers. Each cell receives information both from the previous timestep on its
      own tier, as well as a weighted summary of outputs from a contiguous local group of cells in the previous tier.
      This allows each tier to summarize the information in the previous tier at a lower granularity (and thus a higher
      level of abstraction).
    </p>

    <h3>Results</h3>
    <p>
      I trained{' '}
      <Link href="https://github.com/gcunhase/samplernn-pytorch">this PyTorch implementation of SampleRNN</Link> on two
      datasets - the Dysnomia album by Dawn of Midi once again, as well as a piano dataset (4 hours of piano music - the
      default dataset suggested in the readme). Again, YouTube audio is split into 8 second chunks, converted to mono
      and downsampled to 16kHz. The linked implementation provides a helper script <code>download-from-youtube.sh</code>
      , which is what I used both for SampleRNN and for WaveNet above. Small modifications (discussed below) and
      pretrained models can be found in <Link href="https://github.com/khiner/samplernn-pytorch">this fork</Link>.
    </p>
    <p>
      Training took about a day on a single 2080 Ti graphics card. Note that sampling is <i>faster than realtime</i>.
      This makes it such a cheap operation, relative to training time, that samples are generated by default during
      training checkpoints. Here are some curated examples selected from checkpoints on two representative trained
      models:
    </p>
    <iframe
      title="rnn-playlist-1"
      width="100%"
      height="450"
      allow="autoplay"
      src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/825469604&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=false&show_reposts=false&show_teaser=false&show_artwork=false"
      style={{ marginBottom: '1em' }}
    />
    <iframe
      title="rnn-playlist-2"
      width="100%"
      height="450"
      allow="autoplay"
      src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/825451859&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=false&show_reposts=false&show_teaser=false&show_artwork=false"
      style={{ marginBottom: '1em' }}
    />
    <p>Here are the full instructions for setting up, training and generating the above samples:</p>
    <CodeBlock language="shell">
      {`$ git clone git@github.com:khiner/samplernn-pytorch.git
$ cd samplernn-pytorch
$ conda create -n samplernn python=3.6.8 anaconda
$ conda activate samplernn
$ pip install -r requirements.txt
$ pip install youtube-dl
$ ./datasets/download-from-youtube.sh "https://www.youtube.com/watch?v=EhO_MrRfftU" 8 piano
$ python train.py --exp piano --frame_sizes 16 4 --n_rnn 2 --sample_length=160000 --sampling_temperature=0.95 --n_samples=2 --dataset piano
$ ./datasets/download-from-youtube.sh "https://www.youtube.com/watch?v=zH4lkK-vSco" 8 dawn_of_midi
$ python train.py --exp dawn_of_midi --frame_sizes 16 4 --n_rnn 2 --sample_length=160000 --sampling_temperature=0.95 --n_samples=2 --dataset dawn_of_midi`}
    </CodeBlock>
    <p>
      The arguments <code>--sample_length=160000</code> and <code>--n_samples=2</code> tell the trainer to periodically
      generate and save two 160,000-sample wav files (two 10-second clips of 16kHz audio).
    </p>
    <p>Here are some observations:</p>
    <ul>
      <li>
        <p>
          All of the clips have a kind of bit-crushed quality, especially during quiet segments. This makes sense, since
          the default number of quantization bins, (controlled by the <code>--q_levels</code> argument), is 256 (8 bit
          quantization). However, all of the WaveNet samples above were also generated with 8 bit quantization, and they
          don't have nearly as much of that depth-reduction quality to my ears. One reason for this is likely that
          SampleRNN uses <i>linear</i> quantization, while WaveNet uses{' '}
          <Link href="https://en.wikipedia.org/wiki/%CE%9C-law_algorithm">µ-law</Link> companding quantization, which
          reduces quantization error in low-amplitude signals.
        </p>
        <p>
          I tried to address this by increasing the number of quantization bins to 512. This makes the learning problem
          more difficult by doubling the number of bins in the final softmax classification layer. To compensate, I also
          increased the capacity of the model by increasing the number of RNN layers in each tier (
          <code>--n_rnn 3</code>
          ), and letting it train for about twice as long (a little over two days):
        </p>
        <CodeBlock language="shell">{`$ python train.py --exp dawn_of_midi_3_tier --frame_sizes 16 4 --n_rnn 3 --q_levels 512 --sample_length=160000 --sampling_temperature=0.95 --n_samples=2 --dataset dawn_of_midi`}</CodeBlock>
        <p>
          The results of this experiment aren't really worth sharing as they were similar but with slightly degraded
          quality.
        </p>
        <p>
          Further investigation is needed to figure out why this increase in capacity and resolution capability didn't
          translate to better qualitative results.
        </p>
      </li>
      <li>
        <p>
          The overall quality is pretty good! While the quantization error is more audible than WaveNet, the long-term
          structure and sample diversity is greatly improved. The samples have pauses and swells, melodic movement and
          more restrained rhythms.
        </p>
        <p>
          This agrees with the impression I've gotten from the <Link href="https://dadabots.bandcamp.com/">many</Link>{' '}
          <Link href="https://youtu.be/dTYdRX1b000">impressive</Link>{' '}
          <Link href="https://soundcloud.com/psylent-v/sets/samplernn_iclr2017-tangerine">results</Link> created by the
          ML audio community. SampleRNN has become a go-to model for musicians and coders looking for fresh ways to mash
          audio data together in fascinating new ways, and some folks are getting much better results than I was able to
          in these short experiments.
        </p>
      </li>
      <li>
        <p>
          Training is generally not stable. Predictive accuracy improves quickly early on, and quickly flattens out.
          Often, after many steps, the accuracy can drop and stay low for long periods, resulting in a consistent run of
          poor (crackly, noisy) samples.
        </p>
        <p>
          While I don't have any answers for improving <i>training</i> stability, I found a decent remedy for unstable{' '}
          <i>generation</i>. While looking into different implementations, I saw that this early{' '}
          <Link href="https://github.com/richardassar/SampleRNN_torch">Torch port</Link> of the original authors'
          implementation had a{' '}
          <Link href="https://github.com/richardassar/SampleRNN_torch/blob/master/train.lua#L658">
            <code>sampling_temperature</code>
          </Link>{' '}
          option that allowed for damping the generated samples (at the expense of slightly reduced dynamic range). I
          ported this to the PyTorch implementation in{' '}
          <Link href="https://github.com/khiner/samplernn-pytorch/commit/0b8f678c10e0f053a2f205106b371c137f281873">
            this commit
          </Link>
          , which is the only addition in my fork. I found that a <code>sampling_temperature</code> of around{' '}
          <code>0.95</code> basically fixes the problem of runaway high-amplitude sample generation, while also not
          decaying to silence due to over-damping.
        </p>
      </li>
    </ul>
    <h3>Toward realtime, controllable audio generation for musicians</h3>
    <p>
      Ultimately, musicians need tools capable of both realtime generation, and realtime control. There are many fronts
      converging right now to make that dream possible.
    </p>
    <p>
      As mentioned above, SampleRNN is already capable of faster-than-realtime generation on high-quality GPUs, and
      there are highly optimized implementations of WaveNet that allow for realtime inference, such as Nvidia's{' '}
      <Link href="https://github.com/NVIDIA/nv-wavenet">nv-wavenet</Link>. Another promising avenue of realtime
      generation being explored is{' '}
      <Link href="https://arxiv.org/abs/1902.08710v2">
        adapting generative adversarial networks to the audio domain
      </Link>
      . Towards the goal of providing meaningful control, one promising avenue of research is along the lines of{' '}
      <Link href="https://openai.com/blog/glow/">π invertible generative models</Link>, which allow for exact,
      reversible mapping between latent variables and generated samples. Nvidia's{' '}
      <Link href="https://nv-adlr.github.io/WaveGlow">WaveGlow</Link> model combines these ideas with WaveNet for fast,
      non-autoregressive conditional audio generation. Of course, there are{' '}
      <Link href="http://www.arxiv-sanity.com/search?q=audio+generation">many other</Link> audio generation models being
      developed all the time, and I hope to look into some of these other approaches in future posts!
    </p>
  </div>
)
