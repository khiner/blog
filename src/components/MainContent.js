import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import Sidebar from './Sidebar'
import SummaryList from './SummaryList'
import Entry from './Entry'
import { stripSlashes } from '../utils'

import config from '../config'
import parsedEntries from '../parsedEntries'

import Loadable from 'react-loadable'

function createContentLoadable(entry) {
  return Loadable({
    loader: () => import('../content/' + entry.contentPath),
    loading(props) {
      return <div>Loading...</div>
    },
    render(props) {
      return <div id="loadedContent">{props.default}</div>
    },
  })
}

export default class MainContent extends Component {
  generateComponent(entry) {
    return props => {
      return (
        <Entry {...entry}>
          {entry.contentPath
            ? React.createElement(createContentLoadable(entry))
            : entry.content}
        </Entry>
      )
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
      <div className="contentWrapper">
        {config.entriesInSidebar && (
          <Sidebar
            shouldShowSidebar={this.props.shouldShowSidebar}
            toggle={this.props.toggleSidebar}
          />
        )}
        <Route exact path="/" component={SummaryList} />
        {parsedEntries.all.map(entry => this.generateRoute(entry))}
      </div>
    )
  }
}
