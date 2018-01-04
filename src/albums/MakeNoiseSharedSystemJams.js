import React from 'react'

import make_noise_shared_system_image from './assets/makenoise_shared_system.jpg'
export default (
  <div>
    <div className="videoWrapper">
      <iframe
        title="MakeNoiseSharedSystemJams"
        scrolling="no"
        frameborder="no"
        src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/63454085&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=true"
      />
    </div>
    <p>
      Modular synth patches, made mostly using the Make Noise Shared System:
    </p>
    <img src={make_noise_shared_system_image} alt="Make Noise Shared System" />
  </div>
)
