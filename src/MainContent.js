import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import SummaryList from './SummaryList'
import Entry from './Entry'
import entries from './entries'
import { stripSlashes } from './utils'

export default class MainContent extends Component {
  generateComponent(entry) {
    return props => {
      return <Entry {...entry}>{entry.content}</Entry>
    }
  }

  generateRoute(entry) {
    return (
      <Route
        key={entry.path}
        path={`/${stripSlashes(entry.path)}`}
        render={this.generateComponent(entry)}
      />
    )
  }

  render() {
    return (
      <div>
        <Route exact path="/" component={SummaryList} />
        {entries.map(entry => this.generateRoute(entry))}
      </div>
    )
  }
}
