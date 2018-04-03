import React from 'react'

import Link from '../Link'

export default (
  <div>
    <p>
      <Link href="https://github.com/khiner/AutoSampler">AutoSampler</Link> is
      an intelligent Max4Live instrument that plays audio segments found in your
      library matching the notes of incoming live MIDI. Here's what it looks
      like in action! (A simple sine tone is playing in addition to the
      instrument so you can hear what notes are being played.)
    </p>
    <div className="videoWrapper">
      <iframe
        title="AutoSampler Demo"
        src="https://www.youtube.com/embed/IgO__9XJ2Cg?wmode=opaque&amp;enablejsapi=1"
        scrolling="no"
        frameBorder="0"
      />
    </div>
    <p>
      I love sample-based music but one of the problems I often run into is
      getting stuck in habits, using the same sources for the same job over and
      over again. Need a breakbeat? I know where to get that. Need some smooth
      female vocal samples to cut up? Default to that acappella album I
      downloaded 8 years ago. I have a huge song library in my iTunes folder,
      but when I'm looking for a specific sound, I don't have the time to go
      loop hunting all day long for a sample that's just right. So I end up
      going back to the tried-and-true comforts again and again.
    </p>

    <p>
      My dream instrument would take high-level input from me ("I want a layered
      kick drum, a textured ambient loop and a vocal sample that works with this
      melody...") and give me back things that work well together, giving me
      fresh inspiration and choices to get me started, allowing me to sculpt
      them further into a finished product.
    </p>

    <p>
      AutoSampler doesn't hit this audacious target by any means, but it tackles
      one such specific problem, "I want to find samples in my library that
      match this note or melody and work well together, and I want to play them
      live". It's easy in most DAWs to find a sample and pitch it up and down
      with a keyboard, but if you want to find samples that <em>already</em>{' '}
      match the pitches of a melody and preserve the original sound quality
      entirely, there's no way to do that other than to start digging.
    </p>

    <p>
      As it is, this instrument can find inspiring combinations of samples that
      sound great together. You can trigger them with a keyboard or arpeggiator
      or MIDI effect, loop them and rearrange them. But while I think it is fun
      and unique as an instrument on its own, my real hope is that it helps
      introduce you to more of the raw sounds in your music collection (or maybe
      podcast library, or books on tape...) in a musical context, so that you
      can quickly find inspiration when you're creating a great track.
    </p>

    <p>Have fun, and please share anything you come up with!</p>
  </div>
)
