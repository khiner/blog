import React from 'react'

export default (
  <div>
    <div className="videoWrapper">
      <iframe
        title="MidiMarkovDecompose"
        scrolling="no"
        frameborder="no"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/257110789&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"
      />
    </div>
    <p>
      These pieces were generated from a Markov chain given some classical piano
      MIDI scores as input.
    </p>
    <p>
      Unlike the "MIDI Markov: Compose" album, these pieces introduce
      intentional MIDI errors to generate more experimental, ambient pieces.
    </p>
    <p>
      To reproduce the pieces, run the following (in Terminal, assuming Mac)
    </p>
    <pre>{`
$ git clone git@github.com:khiner/midi_markov.git
$ cd midi_markov
$ gem install bundler
$ bundle install
$ brew install timidity
$ ./midi_markov {PASTE THE TRACK NAME HERE}`}</pre>
    <p>
      It may take up to 30 seconds or so depending on the track and your system.
    </p>
    <p>
      <a href="https://karlhiner.com/music_generation/midi_markov/">
        Read more about it!
      </a>
    </p>
  </div>
)
