import React, { Component } from 'react'

export default class AlbumPreview extends Component {
  render() {
    return (
      <div>
        <div className="videoWrapper">
          <iframe
            title={this.props.title}
            scrolling="no"
            frameBorder="no"
            src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${
              this.props.playlistId
            }&amp;color=%23ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;show_teaser=true&amp;visual=false`}
          />
        </div>
      </div>
    )
  }
}
