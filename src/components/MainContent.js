import React from 'react'
import { Route } from 'react-router-dom'

import SummaryList from './SummaryList'
import Entry from './Entry'
import { stripSlashes } from '../utils'

import parsedEntries from '../parsedEntries'

import loadable from '@loadable/component'

const LoadableEntry = (entry) => {
  const Loadable = loadable(
    async () => {
      const imported = await import('../content/' + entry.contentPath)
      const Content = imported.default
      const element = React.isValidElement(Content) ? Content : <Content />
      return () => <div id="loadedContent">{element}</div>
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

export default function MainContent() {
  return (
    <div className="contentWrapper">
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
