import React from 'react'

import config from '../../config'
import Link from '../../content/Link'
import email_image from './assets/email.png'
import facebook_image from './assets/facebook.png'
import linkedin_image from './assets/linkedin.png'
import reddit_image from './assets/reddit.png'
import twitter_image from './assets/twitter.png'

function ShareButton({ name, href, src }) {
  return (
    <Link>
      <img src={src} alt={name} />
    </Link>
  )
}

export default function ShareButtons({ title, url, hideLabel }) {
  return (
    <div className="shareButtonsParent">
      {!hideLabel && <p>Share</p>}
      <div className="shareButtons">
        <ShareButton
          name="Email"
          href={`mailto:?subject=${title}&body=Though you'd be interested in this!%0D%0A%0D%0A${url}%0D%0A${title}`}
          src={email_image}
        />
        <ShareButton
          name="Twitter"
          href={`https://twitter.com/share?url=${url}&text=${title}${
            config.twitterHandle ? '&via=' + config.twitterHandle : ''
          }`}
          src={twitter_image}
        />
        <ShareButton
          name="Facebook"
          href={`http://www.facebook.com/sharer.php?u=${url}`}
          src={facebook_image}
        />
        <ShareButton
          name="Linkedin"
          href={`http://www.linkedin.com/shareArticle?mini=true&url=${url}`}
          src={linkedin_image}
        />
        <ShareButton
          name="Reddit"
          href={`http://reddit.com/submit?url=${url}&title=${title}`}
          src={reddit_image}
        />
      </div>
    </div>
  )
}
