import Link from 'components/Link'
import CodeBlock from '../CodeBlock'
import beethovens_5th_image from './assets/beethovens_5th.png'
import markov_recipe_image from './assets/markov_recipe.jpg'
import Image from 'components/Image'

export default (
  <div>
    <p>
      <Link href="https://github.com/khiner/midi_markov">Midi Markov</Link> is a command-line tool that uses a Markov
      process to generate MIDI streams based on a provided source directory of MIDI files.
    </p>
    <p>
      I expected this to be more of an academic exercise, getting a few interesting melodies out of it. And while that
      is basically what happened, I actually ended up listening for hours to the sounds it came up with, using only the
      general midi piano sound included with{' '}
      <span>
        <Link href="http://libtimidity.sourceforge.net/">libTiMidity</Link>.
      </span>
    </p>
    <h2>Results</h2>
    <p>
      I uploaded some of the results into two compilations.{' '}
      <Link href="https://karlhiner.com/albums/midi_markov_compose">Compose</Link> is a selection of more vanilla
      generated pieces, and <Link href="https://karlhiner.com/albums/midi_markov_decompose">Decompose</Link> is a
      selection of ambient pieces that stack multiple tones on top of each other, along with some other artifacts owed
      to a happy accident <Link href="https://github.com/khiner/midi_markov#drone-option">I left in as an option</Link>.
      <sup>
        <a href="#aside_1">1</a>
      </sup>
    </p>
    <p>
      The title of each track can be pasted directly as the run options for the program. You can reproduce any of these
      pieces by opening up a terminal window and running:
    </p>
    <CodeBlock language="shell">
      {`$ git clone git@github.com:khiner/midi_markov.git
$ cd midi_markov
$ gem install bundler
$ bundle install
$ brew install timidity
$ ./midi_markov {track_name}`}
    </CodeBlock>
    <p>
      The results vary a lot depending on the parameters and the random seed, from patient harmonic meditations to
      frenetic atonal excursions.
    </p>
    <p>
      <iframe
        title="-d -r 4731 -i midi_files/bach"
        width="100%"
        height="180"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/281748188&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=true"
      />
    </p>
    <p>
      In fact, some of these pieces I like very much, and would otherwise lie outside of my ability to create. Not
      because of technical wizardry, but, ironically, because of their deliberateness and patience, sense of surprise
      and organic feel. The pieces actually have <em>more</em> soul than what I would have come up with if I wanted to
      make a meditative ambient piece. I would never let a few tones linger on for a minute or longer, and I would never
      have used a generic MIDI piano model as the sole sound source. I would have chosen more predictable chord changes.
    </p>
    <p>
      By delegating these decisions to pseudo-randomness, I actually found myself listening more closely than I do with
      my own compositions. In the process of listening (on the edge of my seat) for the next change, I would get
      absorbed with the micro-rhythms created by shifting beat frequencies, and found my focus moving between different
      aspects of what is ultimately a single sound - the buzzing tones of the sustain-portion of a specific grand piano
      software model.
    </p>
    <h2>Markov chains</h2>
    <p>
      A Markov chain is a simple generative tool, often used in generating new sentences from existing ones,{' '}
      <Link href="https://twitter.com/jamieabrew/status/695060640931549184?lang=en">like these recipes:</Link>
    </p>
    <Image src={markov_recipe_image} alt="Recipe generated using a Markov chain" style={{ maxWidth: 500 }} />
    <p>
      <Link href="https://golang.org/doc/codewalk/markov/">
        Here is a good example of how Markov chains are used on natural language.
      </Link>{' '}
      You simply start with a word, find all the words that follow it in the text, and choose randomly from that
      selection, including duplicates, so that you're more likely to choose words that follow it more often. You
      continue on that way until you want to stop, or until you add the last word in the text (if that word doesn't
      occur anywhere else in the text).
    </p>
    <p>
      With text input, there are many possible implementation choices that can change the kinds of text it outputs. You
      could include punctuation with the words or not, require capitalization matches or not, use multiple consecutive
      words as keys, always end when you reach the last word, always start with the first word, etc.
    </p>
    <h2>...with music</h2>
    <p>
      <iframe
        title="example-soundcloud2"
        width="100%"
        height="180"
        src="https://w.soundcloud.com/player/?visual=true&amp;url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F281731103&amp;show_artwork=true&amp;callback=YUI.Env.JSONP.yui_3_17_2_1_1473272933220_5098&amp;wmode=opaque"
      />
    </p>
    <p>
      The same is true with musical notes. In this implementation, there are options to specify many of these choices,
      like{' '}
      <Link href="https://github.com/khiner/midi_markov#match-length-option">
        how many notes must be matched in a row
      </Link>
      , but the general idea is the same: the equivalent of the <em>word</em> is a set of notes that begin
      simultaneously, such as a single note or a chord.{' '}
      <Link href="https://github.com/khiner/midi_markov#match-length-option">Optionally</Link>, you can tell the program
      to change that definition to "a set of notes that begin simultaneously <em>and</em> have the same duration".
    </p>
    <p>
      As an example, consider this passage from Beethoven's 5th:
      <br />
      <Image src={beethovens_5th_image} alt="Beethoven's 5th sheet music" />
      <br />
      This would be what its Markov map would look like if <code>match-length</code> were set to 1:
    </p>
    <pre>
      {`G => (G, G, E) # since a single G is followed by two Gs and one E in the sequence
E => (F)
F => (F, F, D)
D => ()`}
    </pre>
    <p>
      If the last note played in the sequence were an F, for the next note we are twice as likely to choose another F as
      we are a D.
    </p>
    <p>
      If <code>match-length</code> were set to <code>2</code>, the keys in the map would be two note sequences with more
      limited possibilities at each step:
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
      Finally, if <code>match-length=3</code>, the keys would be three-note sequences and we would only have one choice
      at each step. Thus, shorter sequences as keys have more unpredictable results, while longer sequences tend to
      produce passages that follow a particular unique sequence in a MIDI file until reaching a branch at a common
      sequence occurring in another section or file, sounding more like a mashup with natural(-ish) transitions.
    </p>
    <p>
      There are many other ways to guide the algorithm, limit or expand the choices at each step, specify note-length
      and more. I encourage you to{' '}
      <a href="https://github.com/khiner/midi_markov/blob/master/README.md#options">read the documentation</a> and try
      them out, or fork the project and try some other stuff!
    </p>
    <h2>Pros and cons of the Markov approach</h2>
    <p>
      Aren't we in the age of the Nth neural-net boom, where we can stack all sorts of{' '}
      <Link href="http://people.idsia.ch/~juergen/blues/IDSIA-07-02.pdf">LSTMs</Link>,{' '}
      <Link href="http://www.hexahedria.com/2015/08/03/composing-music-with-recurrent-neural-networks/">RNNs</Link> and{' '}
      <Link href="http://www.iro.umontreal.ca/~lisa/twiki/pub/Neurones/DynamicallyLinkedBoltzmannMachines/projet6266_stanislas_lauly.pdf">
        RBMs
      </Link>{' '}
      until our fingers bleed?!
    </p>
    <p>
      Of course the answer is yes. All those impressive-sounding acronyms are impressive. They have insane amounts of
      promise, and are probably the bedrock of a future audio entertainment industry that looks very different than the
      one we have today. But meanwhile, the main problem is... they're slow. Here's a quote from one of those links:
    </p>
    <blockquote>
      I trained the model using a g2.2xlarge <Link href="http://aws.amazon.com/ec2">Amazon Web Services</Link> instance.
      I was able to save money by using "spot instances", which are cheaper, ephemeral instances that can be shut down
      by Amazon and which are priced based on supply and demand. Prices fluctuated between \$0.10 and \$0.15 an hour for
      me, as opposed to \$0.70 for a dedicated on-demand instance. My model used two hidden time-axis layers, each with
      300 nodes, and two note-axis layers, with 100 and 50 nodes, respectively.
    </blockquote>
    <p>
      In other words, your laptop isn't going to be running this as a MIDI effect in your live DJ set. These more
      complex approaches are viable as a studio tool, but not in a live setting, and probably not with real-time
      tweakable parameters (yet). This Markov tool, however, could be ported to a Max4Live patch with params that you
      could tweak on the fly with knobs. The Markov chain itself could easily accept live input from a keyboard, etc.
    </p>
    <p>
      The main downside is that you get what you pay for. Just like Markov-generated text output, the result has no
      sense of large-scale structure and tends to meander from one thing to the next, never returning to its original
      thought. It's extremely rigid and literal, and only looks at what's directly in front of it. It can lead to loops,
      false starts, awkward pauses and unnatural transitions. At the end of the day, it's at best a toy or novelty for
      some musical inspiration - a generative sequencer that's better than random and related to what it's fed. As
      always though, these constraints can be its strengths and can lead to discoveries that wouldn't be possible with
      other more sophisticated approaches.
    </p>
    <p>
      As has been said for Markov-generated natural language, the results can be surprisingly great for how simple it
      is. Most importantly, its simple rules open up infinite and diverse possibilities, changing the role of the
      musician from creator to explorer and curator. It's testament to the fact that with a modern development ecosystem
      you really don't need much sophistication to create something that can actually inspire you or teach you
      something.
    </p>
    <div id="aside_1">
      <p>
        <small>
          <sup>1</sup> The bug was an argument-ordering mistake when instantiating a new <code>MidiEvent</code>. I had
          accidentally passed the delta-time to the channel parameter, causing notes to start when an event happens to
          have a delta-time of 0, but not end until another event with the same note and a 0 delta-time occurs.
        </small>
      </p>
    </div>
  </div>
)
