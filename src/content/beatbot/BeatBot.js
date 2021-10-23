import React from 'react'
import Link from '../Link'

export default (
  <div>
    <p>
      <strong>
        <i>
          Note: This app is deprecated, and I have removed the app from the Play
          store. If you tried it out, thank you and I hope you had some fun with
          it!
        </i>
      </strong>
    </p>
    <p>
      Woo! I am happy to get this out the door. I have worked on this app, off
      and on, for years. I am happy to announce that it finally feels stable,
      does what it was designed to do, and I dare say is pretty fun!
    </p>
    <p>
      <strike>
        <Link href="https://play.google.com/store/apps/details?id=com.odang.beatbot_android">
          Here is the Play Store link.
        </Link>
      </strike>{' '}
      <i>(deprecated)</i>
    </p>
    <h3>Overview</h3>
    <p>
      BeatBot is an Android-native DAW for sample-based beat production. I
      wanted an app that was simple and intuitive so I could express ideas
      quickly, but also flexible and powerful enough to refine sketches into
      reasonably fleshed out tracks. The design is heavily inspired by Ableton's
      MIDI timeline view, and every choice was made to get the most I could out
      of a small-screen, multi-touch format. I wrote the audio and graphics
      backends from scratch to target OpenGL ES (2.0) and OpenSL ES, optimizing
      for performance to support very old, low-spec Android devices.
    </p>
    <p>
      With over 100k lines of code across 1,200 commits, it is, at the time of
      this writing, my most significant software project by a large margin! I
      learned a ton throughout the development of this app, especially about
      low-level audio and graphics programming, software techniques for
      application state management, and strategies for managing personal
      projects with wide scope. I am moving on to other projects and will not be
      developing or supporting this app any further, but I am proud of the end
      result.
    </p>
    <h3>Features and tutorial video</h3>
    <p>
      See{' '}
      <Link href="https://github.com/khiner/beatbot">the GitHub project</Link>{' '}
      for a full feature list. The following video (with narration generously
      provided by my wife, Emily) is the definitive guide.
    </p>
    <p>I hope you get some use out of it. Have fun!</p>
    <div className="videoWrapper">
      <iframe
        title="BeatBot Demo"
        src="https://www.youtube.com/embed/XX6qeg30LSo"
        scrolling="no"
        frameBorder="0"
      />
    </div>
  </div>
)
