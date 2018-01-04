import React from 'react'
import Helmet from 'react-helmet'

import config from './config'
import DiscussionEmbed from './DiscussionEmbed'
import ShareButtons from './follow_and_share/ShareButtons'

export default function Entry(props) {
  const { title, description, descriptionPlainText, url, date, type } = props

  const disqusConfig = {
    title,
    identifier: props.disqusId,
    url,
  }

  const isShowcase = type && type.toLowerCase() === 'showcase'
  const columnBreak = <div className={isShowcase ? 'col-md-1' : 'col-md-2'} />

  var formattedTitle
  if (config.siteName && title) {
    formattedTitle = config.siteName + ' - ' + title
  } else if (config.siteName) {
    formattedTitle = config.siteName
  } else if (title) {
    formattedTitle = title
  }

  return (
    <div className="container">
      <Helmet title={formattedTitle} />
      {columnBreak}
      <div className={'col-xs-12 ' + (isShowcase ? 'col-md-10' : 'col-md-8')}>
        <div className={'mainContent ' + (isShowcase ? 'Showcase well' : '')}>
          {title && <h1>{title}</h1>}
          {date && <h2 className="date">{date}</h2>}
          {props.children}
        </div>
        <ShareButtons
          title={title || ''}
          description={descriptionPlainText || description || ''}
          url={url || ''}
        />
      </div>
      {columnBreak}
      {config.disqusShortname &&
        disqusConfig.identifier && (
          <DiscussionEmbed
            shortname={config.disqusShortname}
            config={disqusConfig}
          />
        )}
    </div>
  )
}
