import React, { Component } from 'react'

import config from '../config'
import Link from '../content/Link'
import email_image from './assets/email.png'
import facebook_image from './assets/facebook.png'
import google_image from './assets/google.png'
import linkedin_image from './assets/linkedin.png'
import reddit_image from './assets/reddit.png'
import stumpleupon_image from './assets/stumbleupon.png'
import twitter_image from './assets/twitter.png'

export default class ShareButtons extends Component {
  renderShareButton(name, href, src) {
    return (
      <Link>
        <img src={src} alt={name} />
      </Link>
    )
  }

  render() {
    const { title, url, hideLabel } = this.props

    return (
      <div className="shareButtonsParent">
        {!hideLabel && <p>Share</p>}
        <div className="shareButtons">
          {this.renderShareButton(
            'Email',
            `mailto:?subject=${title}&body=Though you'd be interested in this!%0D%0A%0D%0A${url}%0D%0A${title}`,
            email_image
          )}
          {this.renderShareButton(
            'Twitter',
            `https://twitter.com/share?url=${url}&text=${title}${
              config.twitterHandle ? '&via=' + config.twitterHandle : ''
            }`,
            twitter_image
          )}
          {this.renderShareButton(
            'Facebook',
            `http://www.facebook.com/sharer.php?u=${url}`,
            facebook_image
          )}
          {this.renderShareButton(
            'Google',
            `https://plus.google.com/share?url=${url}`,
            google_image
          )}
          {this.renderShareButton(
            'LinkedIn',
            `http://www.linkedin.com/shareArticle?mini=true&url=${url}`,
            linkedin_image
          )}
          {this.renderShareButton(
            'Reddit',
            `http://reddit.com/submit?url=${url}&title=${title}`,
            reddit_image
          )}
          {this.renderShareButton(
            'StumbleUpon',
            `http://www.stumbleupon.com/submit?url=${url}&title=${title}`,
            stumpleupon_image
          )}
        </div>
      </div>
    )
  }
}
