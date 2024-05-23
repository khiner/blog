import AlbumPreview from './AlbumPreview'

export default (
  <div>
    <p>These pieces were generated from a Markov chain given some classical piano MIDI scores as input.</p>
    <p>
      Unlike the "MIDI Markov: Compose" album, these pieces introduce intentional MIDI errors to generate more
      experimental, ambient pieces.
    </p>
    <p>To reproduce the pieces, run the following (in Terminal, assuming Mac)</p>
    <pre>{`
$ git clone git@github.com:khiner/midi_markov.git
$ cd midi_markov
$ gem install bundler
$ bundle install
$ brew install timidity
$ ./midi_markov {PASTE THE TRACK NAME HERE}`}</pre>
    <p>It may take up to 30 seconds or so depending on the track and your system.</p>
    <p>
      <a href="https://karlhiner.com/music_generation/midi_markov/">Read more about it!</a>
    </p>
    <AlbumPreview title="MidiMarkov: Decompose" playlistId="257110789" />
  </div>
)
