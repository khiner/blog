import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Panel } from 'react-bootstrap'
import Helmet from 'react-helmet'

import config from './config'
import parsedEntries from './parsedEntries'
import ShareButtons from './follow_and_share/ShareButtons'

export default class SummaryList extends Component {
  header(entry) {
    return (
      <Link to={entry.path}>
        <h1>{entry.title}</h1>
        <h2 className="date">{entry.date}</h2>
      </Link>
    )
  }

  panel(entry) {
    return (
      <Panel key={entry.path} header={this.header(entry)}>
        <div className="main-content">{entry.description}</div>
      </Panel>
    )
  }

  render() {
    return (
      <div>
        {config && config.siteTitle && <Helmet title={config.siteTitle} />}
        <div className="col-md-2" />
        <div className="col-xs-12 col-md-8">
          <ShareButtons
            title={config.siteName}
            description={`${config.siteName}`}
            url={config.host}
          />
          {parsedEntries.reverseChronological.map(entry => this.panel(entry))}
        </div>
        <div className="col-md-2" />
      </div>
    )
  }
}
