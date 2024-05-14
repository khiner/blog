import React from 'react'

export default ({ src, type = 'video/mp4' }) => (
  <video className="responsive wide" playsInline autoPlay muted loop>
    <source src={src} type={type} />
    Your browser does not support the video tag.
  </video>
)
