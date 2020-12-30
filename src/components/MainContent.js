import React from 'react'
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

function generateComponent(entry) {
  return props => (
    <Entry {...entry}>
      {entry.contentPath
        ? React.createElement(createContentLoadable(entry))
        : entry.content}
    </Entry>
  )
}

export default function MainContent({ shouldShowSidebar, toggleSidebar }) {
  return (
    <div className="contentWrapper">
      {config.entriesInSidebar && (
        <Sidebar
          shouldShowSidebar={shouldShowSidebar}
          toggle={toggleSidebar}
        />
      )}
      <Route exact path="/" component={SummaryList} />
      {parsedEntries.all.map(entry => <Route
        key={entry.path}
        path={`/${stripSlashes(entry.path)}`}
        render={generateComponent(entry)}
      />)}
    </div>
  )
}
