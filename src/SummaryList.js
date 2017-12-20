import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { Panel } from 'react-bootstrap'
import entries from './entries'

export default class SummaryList extends Component {
  header(entry) {
    return (
      <div>
        <Link to={entry.path}>
          <h1>{entry.title}</h1>
        </Link>
        <h2 className="date">{entry.date}</h2>
      </div>
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
        <div className="col-md-2" />
        <div className="col-xs-12 col-md-8">
          {entries
            .filter(entry => !entry.excludeFromFrontPage)
            .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
            .map(entry => this.panel(entry))}
        </div>
        <div className="col-md-2" />
      </div>
    )
  }
}
