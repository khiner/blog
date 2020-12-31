import React from 'react'
import { Route } from 'react-router-dom'

import Sidebar from './Sidebar'
import SummaryList from './SummaryList'
import Entry from './Entry'
import { stripSlashes } from '../utils'

import config from '../config'
import parsedEntries from '../parsedEntries'

import loadable from '@loadable/component'

const LoadableEntry = (entry) => {
  const Loadable = loadable(
    async () => {
      const imported = await import('../content/' + entry.contentPath)
      return () => <div id="loadedContent">{imported.default}</div>
    },
    { fallback: <div>Loading...</div> }
  )
  return <Loadable />
}

function generateComponent(entry) {
  return (props) => (
    <Entry {...entry}>
      {entry.contentPath ? LoadableEntry(entry) : entry.content}
    </Entry>
  )
}

export default function MainContent({ shouldShowSidebar, toggleSidebar }) {
  return (
    <div className="contentWrapper">
      {config.entriesInSidebar && (
        <Sidebar shouldShowSidebar={shouldShowSidebar} toggle={toggleSidebar} />
      )}
      <Route exact path="/" component={SummaryList} />
      {parsedEntries.all.map((entry) => (
        <Route
          key={entry.path}
          path={`/${stripSlashes(entry.path)}`}
          render={generateComponent(entry)}
        />
      ))}
    </div>
  )
}
