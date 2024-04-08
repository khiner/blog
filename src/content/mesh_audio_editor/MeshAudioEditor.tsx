import React from 'react'
import Link from '../Link'

import wood_plate from './assets/RealImpact_27_WoodPlate.png'

export default (
  <div>
    <i>
      Coming soon! See <Link href="https://github.com/khiner/mesh2audio">here</Link> for a demo video and sound examples
      of an older version.
    </i>
    <img
      style={{ width: '75%' }}
      src={wood_plate}
      alt="Wooden plate mesh in the RealImpact mesh editor, with a listener position (reprecented by a cylinder) selected and the modal audio control panel open"
    />
    <Link href="https://github.com/khiner/MeshEditor">Mesh Audio Editor</Link> is a mesh editor with support for
    converting meshes into modal physical audio models that can be struck at any vertex with the mouse (or excited by an
    external audio signal such as a microphone). It is also a{' '}
    <Link href="https://arxiv.org/abs/2306.09944">RealImpact dataset</Link> explorer - any mesh loaded from a RealImpact
    dataset supports comparing the audio produced by the mesh's audio model to the real-world recording of the object
    (from which the mesh was scanned) being struck a selected vertex and listener position (cylinders showing the
    positions of 15 microphones at 10 angles with 4 distances each = 600 listener points for each of 5 impact points for
    each object). The following features support evaluation of autio model accuracy compared to real-world audio
    recordings:
    <ul>
      <li>"Strike" real-world and model models at the same points to compare qualitatively.</li>
      <li>Compare waveforms/spectrograms visually.</li>
      <li>Compare various losses over waveforms/spectrograms.</li>
    </ul>
  </div>
)
