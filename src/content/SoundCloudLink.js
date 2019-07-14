import React, { Component } from 'react'

export default class SoundCloudLink extends Component {
  render() {
    const { trackId } = this.props

    return (
      <iframe
        className="soundcloud-small"
        title="title"
        height="20"
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&inverse=false&auto_play=false&show_user=true`}
      />
    )
  }
}
