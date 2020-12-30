import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { Card } from 'react-bootstrap'

import config from './config'
import DiscussionEmbed from './DiscussionEmbed'
import ShareButtons from './follow_and_share/ShareButtons'

export default class Entry extends Component {
  constructor(props) {
    super(props)
    // arrow functions not working after eslint update.
    this.formatMathWhenContentIsReady = this.formatMathWhenContentIsReady.bind(
      this
    )
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  formatMathWhenContentIsReady() {
    const element = document.getElementById('loadedContent')
    if (typeof element === 'undefined' || element === null) {
      window.requestAnimationFrame(this.formatMathWhenContentIsReady)
    } else {
      window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'MathOutput'])
    }
  }

  componentDidMount() {
    this.formatMathWhenContentIsReady()
  }

  header(title, date) {
    return (
      <div>
        <h1 className="title">{title}</h1>
        <h2 className="date">{date}</h2>
      </div>
    )
  }

  render() {
    const {
      title,
      subtitle,
      description,
      descriptionPlainText,
      disqusId,
      url,
      date,
      type,
    } = this.props

    const disqusConfig = {
      title,
      identifier: disqusId,
      url,
    }

    const isShowcase = type && type.toLowerCase() === 'showcase'
    const columnBreak = <div className="col-md-1 col-lg-2" />

    var formattedTitle
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
              {this.props.children}
            </div>
          )}
          {isShowcase && (
            <Card>
              <Card.Header>{this.header(title, date)}</Card.Header>
              <Card.Body>
                <div className="mainContent Showcase">
                  {this.props.children}
                </div>
              </Card.Body>
            </Card>
          )}

          {title &&
            url && (
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
}
