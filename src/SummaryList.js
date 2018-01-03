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
      <div>
        <h1>{entry.title}</h1>
        <h2 className="date">{entry.date}</h2>
      </div>
    )
  }

  panel(entry) {
    return (
      <Link to={entry.path} key={entry.path}>
        <Panel header={this.header(entry)}>
          <div className="main-content">{entry.description}</div>
        </Panel>
      </Link>
    )
  }

  render() {
    return (
      <div className="summary-list">
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
