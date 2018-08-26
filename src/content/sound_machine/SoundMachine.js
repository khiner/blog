import React from 'react'
import Link from '../Link'

import preview from './assets/sound_machine_short_demo.gif'

export default (
  <div>
    <img style={{ width: '75%' }} src={preview} alt="short preview of app UI" />
    <Link href="https://github.com/khiner/sound-machine">Sound Machine</Link> is
    an unimaginative filler name for a music production project I've spent the
    last couple of months working on. It is very much in early development
    stages, but I thought I'd share what I've got so far!
    <h2>What is it?</h2>
    <p>
      It is a standalone desktop music production application written in C++
      using the JUCE framework. It can run on any modern Mac, and it is designed
      to be used with Ableton's Push 2 hardware, although it can be used with a
      plain old mouse and keyboard as well.
    </p>
    <p>
      Sound-machine (for lack of a better name right now) is a modular patching
      environment and plugin host. It allows for arbitrary connections between
      internal processors and 3rd party plugins, as well as external audio and
      MIDI IO. Unlike other modular music software tools, however, it is
      opinionated. By default it behaves similar to a DAW, like Ableton, with
      separate tracks that each have sound producers and effects connected in
      series, each with a mixer channel that connects to a master track. This
      means it can feel a lot like using a traditional DAW - adding tracks and
      adding devices to tracks, adjusting mixer levels etc. Unlike traditional
      DAWs, all the default connections are visible and alterable, and you can
      connect things however you want. (For a complete description of how
      default and custom connections behave, see Default and Custom
      Connections.)
    </p>
    <p>
      Every aspect of the design of this application has hardware control in
      mind, and specifically for deep integration with Ableton's Push 2.
      Processors are arranged in an 8X8 grid to be selected, moved, connected
      and controlled via the 64-pad grid of the Push 2.
    </p>
    <h2>Why?</h2>
    <p>
      I've made music off and on as a hobby for most of my life. A few years ago
      I started getting into modular synthesis, and I fell in love with the
      immediacy and surprise of it. More and more, I started thinking about and
      working with music as an _active_ and _improvisational_ creative process,
      and became less interested in the editing, arranging, mixing and mastering
      aspects of producing full, polished tracks.
    </p>
    <p>
      I also became really inspired and actually pretty blown away by{' '}
      <Link href="https://youtu.be/hQbg-uHwcig">
        Tim Exile's "Flow Machine"
      </Link>{' '}
      - a jumble of old MIDI hardware and crazy custom Reaktor patches made by
      Tim to solve his own needs for a super-immediate and powerful
      looper-effect-jam-box. I really wanted that immediacy of being able to
      just sing and play and start capturing, looping and manipulating audio
      from the outside world into manglers in the digital world as quickly as
      possible.
    </p>
    <p>
      In addition to wanting a jambox like Tim Exile has going on, I'm very
      interested in the idea of making what you might call an "intelligent"
      music instrument. One where you could, say, hum a tune and it would
      translate it to MIDI and maybe even know what instrument you want. Or
      beatbox and it would classify the sounds and make a beat with similar
      sounds from my sample library. Or generate melodies based on music in my
      library to play along with me.
    </p>
    <p>
      What I really want is something that:
      <ul>
        <li>is flexible, immediate, quick and fun</li>
        <li>
          allows me to learn more about audio & DSP and quickly turn ideas into
          something I can play with and integrate, with minimal boilerplate and
          overhead
        </li>
        <li>can process, mangle and loop audio and MIDI from the real world</li>
        <li>
          integrates with other plugins and external hardware that I already use
        </li>
        <li>
          allows for meta-creation, e.g. instruments that create other
          instruments or drum machines that choose their own samples
        </li>
      </ul>
    </p>
    <p>
      These are pretty big goals and there's a long way to go, but this app is
      starting to feel like a stable foundation to iterate towards them bit by
      bit!
    </p>
    <h2>Details</h2>
    <p>
      Documentation of features as they stand now can be found in the{' '}
      <Link href="https://github.com/khiner/sound-machine#guide">
        Guide section
      </Link>{' '}
      of the README. I'll do my best to keep this up-to-date as things move
      along.
    </p>
    <h2>What's next?</h2>
    <p>
      I'm putting the project on pause as I'm winding up my free time off and
      looking for work. But I plan on continuing to work on this when I get
      time! The next big things in the hopper are:
      <ul>
        <li>
          <i>Navigating unlimited number of processors per track:</i> Unlimited
          tracks and navigating beyond the initial page is done. Still need to
          do the same for the "vertical" direction.
        </li>
        <li>
          <i>"Global modulators" processor row above tracks:</i> For
          convenience, it makes sense to have an obvious place to put processors
          that don't make any default-connections and are intended as modulators
          that affect many processors across many tracks.
        </li>
        <li>
          <i>Multi-selection:</i> The usual ctrl+select/shift+select behavior to
          select and move groups of processors or tracks together.
        </li>
        <li>
          <i>Moving processors with the Push 2:</i> A "layout" view that allows
          for selection and moving of processors using its 8X8 pad grid.
        </li>
        <li>
          <i>
            <font style={{ 'font-weight': 'bold' }}>Patching parameters!</font>
          </i>{' '}
          Currently only audio patching is possible. A big goal in this project
          is being able to patch anything to anything, and that of course
          includes parameters. The current plan is that only audio connections
          will be visible in the grid-view (as it is currently), and the panel
          to the right that currently only shows a single processor's parameters
          will be for parameter-patching.
        </li>
        <li>
          <i>
            <font style={{ 'font-weight': 'bold' }}>Nested processors!</font>
          </i>{' '}
          Another big goal - the workflow I'm working towards here is that
          everything in the current grid (or a selected subgroup) could be{' '}
          <i>consolidated</i> into what behaves like a single processor,
          occupying one processor cell with its own IO pins. This would be the
          main organizational hammer of the app, allowing for "Russian doll"
          nesting to arbitrary levels. I also plan to use this mechanism to make
          (and enable others to develop) more complicated "meta-processors" -
          processors composed of other processors, with some mechanism of
          programatically creating, moving and connecting processors.
        </li>
        <li>
          <i>Sampler/Looper processor</i>
        </li>
        <li>
          <i>
            <font style={{ 'font-weight': 'bold' }}>"System" modulators?</font>
          </i>{' '}
          Some way to have quick global access and assignment of things like
          master clock & tempo, as well as trigger and velocity events from the
          Push 2 pad that a processor occupies.
        </li>
        <li>
          <i>Drum-machine "meta-processor":</i> The first "meta-processor"
          instrument, to demonstrate the power of this battle station.
        </li>
        <li>
          <i>Param automation recording</i>
        </li>
        <li>
          <i>Port all Mutable Instruments modules to processors</i>
        </li>
        <li>
          <i>Add lots of basic utility processors:</i> (LFOs, clock dividers,
          sample&hold, etc)
        </li>
        <li>
          <i>Add audio/MIDI record/loop processors</i> and an integrated way to
          record loops and store for selection with Push2 pads, like Ableton's
          "clips"
        </li>
      </ul>
    </p>
  </div>
)
