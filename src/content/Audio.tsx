import React from 'react'

export default ({ src, type = 'audio/wav' }) => (
  <audio controls={true}>
    <source src={src} type={type} />
    Your browser does not support the audio tag.
  </audio>
)
