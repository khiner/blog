import React from 'react'

import AlbumPreview from './AlbumPreview'

import make_noise_shared_system_image from './assets/makenoise_shared_system.jpg'

export default (
  <div>
    <p>
      Modular synth patches, made mostly using the Make Noise Shared System:
    </p>
    <img src={make_noise_shared_system_image} alt="Make Noise Shared System" />
    <AlbumPreview title="MakeNoise Shared System Jams" playlistId="63454085" />
  </div>
)
