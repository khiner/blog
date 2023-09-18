import React from 'react'
import { Route, Routes } from 'react-router-dom'

import SummaryList from './SummaryList'
import Entry from './Entry'
import { stripSlashes } from '../utils'

import parsedEntries from '../parsedEntries'

import loadable from '@loadable/component'

const modules = import.meta.glob('../content/**/*.jsx')

const LoadableEntry = (entry) => {
  const Loadable = loadable(
    async () => {
      const imported = await modules[`../content/${entry.contentPath}.jsx`]()
      const Content = imported.default
      const element = React.isValidElement(Content) ? Content : <Content />
      return () => <div id="loadedContent">{element}</div>
    },
    { fallback: <div>Loading...</div> },
  )
  return <Loadable />
}

export default () => (
  <div className="contentWrapper">
    <Routes>
      <Route exact path="/" element={SummaryList} />
      {parsedEntries.all.map((entry) => (
        <Route
          key={entry.path}
          path={`/${stripSlashes(entry.path)}`}
          element={<Entry {...entry}>{entry.contentPath ? LoadableEntry(entry) : entry.content}</Entry>}
        />
      ))}
    </Routes>
  </div>
)
