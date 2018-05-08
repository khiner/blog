import React from 'react'

import Link from '../Link'

import beethovens_5th_image from './assets/beethovens_5th.png'
import markov_recipe_image from './assets/markov_recipe.jpg'

export default (
  <div>
    <p>
      <Link href="https://github.com/khiner/midi_markov">Midi Markov</Link> is a
      command-line tool that uses a Markov process to generate MIDI streams
      based on a folder of MIDI source material.
    </p>
    <p>
      I expected the process of making this to be more of an academic exercise,
      maybe making a few interesting melodies but really just being more of a
      fun toy or a tool in a larger arsenal of more sophisticated music
      generation, but I ended up listening for hours (more than I care to admit,
      really) to the sounds it came up with, using only the general midi piano
      sound included with{' '}
      <span>
        <Link href="http://libtimidity.sourceforge.net/">libTiMidity</Link>.
      </span>
    </p>
    <h2>Results</h2>
    <p>
      I uploaded some of the results into two compilations.{' '}
      <Link href="https://soundcloud.com/odangludo/sets/midi-markov-compose">
        Compose
      </Link>{' '}
      is a selection of more vanilla generated pieces that sound very...
      Markov-y, and{' '}
      <Link href="https://soundcloud.com/odangludo/sets/midi-markov-decompose">
        Decompose
      </Link>{' '}
      is a selection of ambient pieces that stack multiple tones on top of each
      other, along with some other artifacts owed to a happy accident{' '}
      <Link href="https://github.com/khiner/midi_markov#drone-option">
        that I left in as an option
      </Link>. (The bug was in argument-ordering when instantiating a new
      MidiEvent, where I had accidentally passed the delta-time to the channel
      parameter, causing notes to start when an event happens to have a
      delta-time of 0, but not end until another event with the same note and a
      0 delta-time occurs.)
    </p>
    <p>
      The title of each track can be pasted directly as run-options for the
      program. You can reproduce any of these pieces by opening up a terminal
      window (if you're on Mac) and running:
    </p>
    <pre>{`$ git clone git@github.com:khiner/midi_markov.git
$ cd midi_markov
$ gem install bundler
$ bundle install
$ brew install timidity
$ ./midi_markov {PASTE THE TRACK NAME HERE}`}</pre>
    <p dir="ltr">
      The results vary a ton depending on the parameters and the random seed,
      from patient harmonic meditations to frenetic atonal excursions.
    </p>
    <div>
      <div>
        <iframe
          title="example-soundcloud1"
          width="100%"
          height="180"
          scrolling="no"
          frameBorder="no"
          src="https://w.soundcloud.com/player/?visual=true&amp;url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F281747547&amp;show_artwork=true&amp;callback=YUI.Env.JSONP.yui_3_17_2_1_1473272933220_2984&amp;wmode=opaque"
        />
      </div>
    </div>
    <p>
      In fact, some of these pieces I like very much, and would otherwise lie
      outside of my ability to create. Not because of technical wizardry, but
      ironically because of their deliberateness and patience, sense of surprise
      and organic feel. The pieces actually have <em>more</em> soul than what I
      would have come up with if I wanted to make a meditative ambient piece. I
      would never let a few tones linger on for a minute or longer, and I would
      never have used a generic midi piano model as the sole sound source. I
      would have chosen more predictable chord changes.
    </p>
    <p>
      By delegating these decisions to pseudo-randomness, I actually found
      myself listening more closely than when I have control over every
      parameter. In the process of listening (on the edge of my seat) for the
      next change, would get absorbed with the microrhythms created by shifting
      beat frequencies and would find my focus moving between different aspects
      of the sound. It reminds me a bit of{' '}
      <Link href="https://soundcloud.com/editionsmego/thomas-brinkmann-agent-orange">
        Thomas Brinkmann
      </Link>{' '}
      in the way draws attention to various aspects of a single sound - in this
      case, the buzzing tones of the sustain-portion of a particular grand piano
      model.
    </p>
    <h2>Markov chains</h2>
    <p>
      Markov chains are simple generative tools often used in generating new
      sentences from existing ones,{' '}
      <Link href="https://twitter.com/jamieabrew/status/695060640931549184?lang=en">
        like these recipes:
      </Link>
    </p>
    <img
      src={markov_recipe_image}
      alt="Recipe generated using a Markov chain"
      style={{ width: '50%' }}
    />
    <p>
      <Link href="https://golang.org/doc/codewalk/markov/">
        Here is a good example of how Markov chains are used on natural
        language.
      </Link>{' '}
      You simply start with a word, find all the words that follow it in the
      text, and choose randomly from that selection, including duplicates, so
      that you're more likely to choose words that follow it more often. You
      continue on that way until you want to stop, or until you add the last
      word in the text (if that word doesn't occur anywhere else so that nothing
      can follow it).
    </p>
    <p>
      With text input, there are many choices to make that can each change the
      outcome, make it more or less structured, varied, etc. You could include
      punctuation with the words or not, require capitalization matches or not,
      use multiple consecutive words as keys, always end when you reach the last
      word, always start with the first word, etc.
    </p>
    <h2>...with music</h2>
    <div>
      <div>
        <iframe
          title="example-soundcloud2"
          width="100%"
          height="180"
          scrolling="no"
          frameBorder="no"
          src="https://w.soundcloud.com/player/?visual=true&amp;url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F281731103&amp;show_artwork=true&amp;callback=YUI.Env.JSONP.yui_3_17_2_1_1473272933220_5098&amp;wmode=opaque"
        />
      </div>
    </div>
    <p>
      The same is true with musical notes. In my implementation, there are
      options to specify many of these choices, like{' '}
      <Link href="https://github.com/khiner/midi_markov#match-length-option">
        how many notes must be matched in a row
      </Link>, ..., but the general idea is always the same - the equivalent of
      the <em>word</em> is a set of notes that begin simultaneously, such as a
      single note or a chord.{' '}
      <Link href="https://github.com/khiner/midi_markov#match-length-option">
        Optionally
      </Link>, you can tell the program to change that definition to "a set of
      notes that begin simultaneously <em>and</em> have the same duration" (or{' '}
      <em>delta </em>in MIDI parlance).
    </p>
    <p>
      As an example, consider this passage from Beethoven's 5th:
      <br />
      <img src={beethovens_5th_image} alt="Beethoven's 5th sheet music" />
      <br />
      This would be what its Markov map would look like if{' '}
      <code>match-length</code> were set to 1:
    </p>
    <pre>
      {`G => (G, G, E) # since a single G is followed by two Gs and one E in the sequence
E => (F)
F => (F, F, D)
D => ()`}
    </pre>
    <p>
      If the last note played in the sequence were an F, for the next note we
      are twice as likely to choose another F as we are a D.
    </p>
    <p>
      If <code>match-length</code> were set to 2, the keys in the map would be
      two note sequences with more limited possibilities at each step:
    </p>
    <pre>
      {`[G,G] => (G, E) # since two consecutive Gs are followed by one G and one E in the sequence
[G,E] => (F)
[E,F] => (F)
[F,F] => (F,D)
[F,D] => (D)
[F,F] => (F, D)
[F,D] => ()`}
    </pre>
    <p>
      Finally, if <code>match-length=3</code>, the keys would be three-note
      sequences and we would only have one choice at each step. Thus, shorter
      sequences as keys have more unpredictable results while longer sequences
      tend to produce passages that follow a particular unique sequence in a
      MIDI file until reaching a branch at a common sequence occurring in
      another section or file, sounding more like a kind of greatest-hits mashup
      with natural(-ish) transitions.
    </p>
    <p>
      There are many other ways to guide the algorithm, limit or expand the
      choices at each step, specify note length and more. I encourage you to{' '}
      <a href="https://github.com/khiner/midi_markov/blob/master/README.md#options">
        read the documentation
      </a>{' '}
      and try them out, or fork the project and try some other stuff!
    </p>
    <h2>Pros and cons of the Markov approach</h2>
    <p>
      Markov chains are sooooo early 2000's! Aren't we in the age of the Nth
      neural-net boom, where we can stack all sorts of{' '}
      <Link href="http://people.idsia.ch/~juergen/blues/IDSIA-07-02.pdf">
        LSTMs
      </Link>,{' '}
      <Link href="http://www.hexahedria.com/2015/08/03/composing-music-with-recurrent-neural-networks/">
        RNNs
      </Link>{' '}
      and{' '}
      <Link href="http://www.iro.umontreal.ca/~lisa/twiki/pub/Neurones/DynamicallyLinkedBoltzmannMachines/projet6266_stanislas_lauly.pdf">
        RBMs
      </Link>{' '}
      and other impressive-sounding acronyms until our fingers bleed?!
    </p>
    <p>
      Of course the answer is yes. All those impressive-sounding acronyms are
      impressive, they have insane amounts of promise and are probably the
      bedrock of a future audio entertainment industry that looks very different
      than the one we have today. But meanwhile, the main problem is... they're
      slow. Here's a quote from one of those links:
    </p>
    <blockquote>
      I trained the model using a g2.2xlarge{' '}
      <Link href="http://aws.amazon.com/ec2">Amazon Web Services</Link>{' '}
      instance. I was able to save money by using "spot instances", which are
      cheaper, ephemeral instances that can be shut down by Amazon and which are
      priced based on supply and demand. Prices fluctuated between \$0.10 and
      \$0.15 an hour for me, as opposed to \$0.70 for a dedicated on-demand
      instance. My model used two hidden time-axis layers, each with 300 nodes,
      and two note-axis layers, with 100 and 50 nodes, respectively.
    </blockquote>
    <p>
      In other words, your laptop isn't going to be running this as a MIDI
      effect in your live DJ set. I started to train the model referred to in
      that quote and ended up giving up waiting after 30 minutes. These more
      complex approaches are viable as a studio tool, but not in a live setting,
      and probably not with tweakable parameters with instant feedback (yet).
      This Markov tool, however, could be ported to a Max4Live patch with params
      that you could tweak on the fly with knobs. The Markov chain itself could
      easily accept live input from a keyboard, etc.
    </p>
    <p>
      The main downside is that you get what you pay for. Just like
      Markov-generated text output, the result has no sense of large-scale
      structure and tends to meander from one thing to the next, never returning
      to its original thought. It's extremely rigid and literal, has no concepts
      of the musical domain built in, and only looks at what's directly in front
      of it. It can lead to loops, false starts, awkward pauses and unnatural
      transitions. At the end of the day, it's at best a toy or novelty for some
      musical inspiration - a generative sequencer that's better than random and
      related to what it's been fed. Of course, these constraints, as always,
      can be its strengths and can lead to discoveries that wouldn't be possible
      with other more sophisticated approaches.
    </p>
    <p>
      But as has been said for natural-language generation with Markov, the
      results can be surprisingly great for how simple it is. Most importantly,
      its simple rules open up infinite and diverse possibilities, changing the
      role of the musician from creator to explorer and curator. It's testament
      to the fact that with a modern development ecosystem you really don't need
      much sophistication to create something that can actually inspire you or
      teach you something.
    </p>
  </div>
)
