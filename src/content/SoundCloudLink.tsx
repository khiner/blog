import React from 'react'

export default ({ trackId }) => (
  <iframe
    className="soundcloud-small"
    title="title"
    height="20"
    allow="autoplay"
    src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&inverse=false&auto_play=false&show_user=true`}
  />
)
