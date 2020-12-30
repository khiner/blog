import React, { useEffect } from 'react'
import Helmet from 'react-helmet'
import { Card } from 'react-bootstrap'

import config from '../config'
import DiscussionEmbed from './DiscussionEmbed'
import ShareButtons from './follow_and_share/ShareButtons'

function formatMathWhenContentIsReady() {
  const element = document.getElementById('loadedContent')
  if (typeof element === 'undefined' || element === null) {
    window.requestAnimationFrame(formatMathWhenContentIsReady)
  } else {
    window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'MathOutput'])
  }
}

function Header({ title, date }) {
  return (
    <div>
      <h1 className="title">{title}</h1>
      <h2 className="date">{date}</h2>
    </div>
  )
}

// TODO memo?
// shouldComponentUpdate(nextProps, nextState) {
// return false
// }

export default function Entry({
  title,
  subtitle,
  description,
  descriptionPlainText,
  disqusId,
  url,
  date,
  type,
  children,
}) {
  useEffect(() => {
    formatMathWhenContentIsReady()
  }, [])

  const disqusConfig = {
    title,
    identifier: disqusId,
    url,
  }

  const isShowcase = type && type.toLowerCase() === 'showcase'
  const columnBreak = <div className="col-md-1 col-lg-2" />

  let formattedTitle
  if (config.siteName && title) {
    formattedTitle = config.siteName + ' - ' + title
  } else if (config.siteName) {
    formattedTitle = config.siteName
  } else if (title) {
    formattedTitle = title
  }

  return (
    <div>
      <Helmet title={formattedTitle} />
      {columnBreak}
      <div className="container col-xs-12 col-md-10 col-lg-8">
        {!isShowcase && (
          <div id="mainContent" className="mainContent">
            {title && <h1 className="title">{title}</h1>}
            {subtitle && <h2 className="subtitle">{subtitle}</h2>}
            {date && <h3 className="date">{date}</h3>}
            {children}
          </div>
        )}
        {isShowcase && (
          <Card>
            <Card.Header>
              <Header title={title} date={date} />
            </Card.Header>
            <Card.Body>
              <div className="mainContent Showcase">{children}</div>
            </Card.Body>
          </Card>
        )}

        {title && url && (
          <ShareButtons
            title={title || ''}
            description={descriptionPlainText || description || ''}
            url={url || ''}
          />
        )}
      </div>
      {columnBreak}
      {config.disqusShortname &&
        disqusConfig.url &&
        disqusConfig.identifier && (
          <DiscussionEmbed
            shortname={config.disqusShortname}
            config={disqusConfig}
          />
        )}
    </div>
  )
}
