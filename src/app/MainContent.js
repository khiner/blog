import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import Sidebar from './Sidebar'
import SummaryList from './SummaryList'
import Entry from './Entry'
import { stripSlashes } from './utils'

import config from '../config'
import parsedEntries from './parsedEntries'

import Loadable from 'react-loadable'

function createContentLoadable(contentPath) {
  return Loadable({
    loader: () => import('../content/' + contentPath),
    loading(props) {
      return <div>Loading...</div>
    },
    render(props) {
      return props.default
    },
  })
}

export default class MainContent extends Component {
  generateComponent(entry) {
    return props => {
      return (
        <Entry {...entry}>
          {entry.contentPath
            ? React.createElement(createContentLoadable(entry.contentPath))
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
            shouldShow={this.props.shouldShowSidebar}
            toggle={this.props.toggleSidebar}
          />
        )}
        <Route exact path="/" component={SummaryList} />
        {parsedEntries.all.map(entry => this.generateRoute(entry))}
      </div>
    )
  }
}
