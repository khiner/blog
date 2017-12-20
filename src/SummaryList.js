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
        {entry.description}
      </Panel>
    )
  }

  render() {
    return (
      <ul>
        {entries
          .filter(entry => !entry.excludeFromFrontPage)
          .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
          .map(entry => this.panel(entry))}
      </ul>
    )
  }
}
