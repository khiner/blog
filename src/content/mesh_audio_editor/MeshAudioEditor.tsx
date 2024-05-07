import React from 'react'
import Link from '../Link'

import preview_image from './assets/RealImpact_CeramicPitcher.png'

export default (
  <div>
    <p>
      <Link href="https://github.com/khiner/MeshEditor">Mesh Audio Editor</Link> is a 3D mesh editor that can convert
      meshes into interactive, configurable, real-time physical audio models that can be "struck" at any vertex (or
      excited by an external audio signal). It is also a{' '}
      <Link href="https://arxiv.org/abs/2306.09944">RealImpact dataset</Link> explorer - any mesh loaded from the{' '}
      <i>RealImpact</i> dataset supports comparing its model-synthesized impact audio with the corresponding impact
      recording of the object (from which the surface mesh was scanned) being struck the same vertex.
    </p>
    <i>More details coming soon.</i>
    <img
      style={{ width: '75%' }}
      src={preview_image}
      alt="Ceramic pitcher mesh in the RealImpact mesh editor, with modal audio control panel open"
    />
  </div>
)
