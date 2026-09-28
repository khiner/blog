import React from 'react'
import { Route, Routes } from 'react-router-dom'

import SummaryList from './SummaryList'
import Home from './Home'
import GitHubActivity from './GitHubActivity'
import Entry from './Entry'
import { stripSlashes } from 'utils'

import parsedEntries from 'parsedEntries'

import loadable from '@loadable/component'

const modules = import.meta.glob<{ default: any }>('../content/**/*.tsx')

const LoadableEntry = (entry) => {
  const Loadable = loadable(
    async () => {
      const imported = await modules[`../content/${entry.contentPath}.tsx`]()
      const Content = imported.default
      const element = React.isValidElement(Content) ? Content : <Content />
      return () => <div id="loadedContent">{element}</div>
    },
    { fallback: <div>Loading...</div> },
  )
  return <Loadable />
}

const entryRoute = (entry) => (
  <Route
    key={entry.path}
    path={`/${stripSlashes(entry.path)}`}
    element={<Entry {...entry}>{entry.contentPath ? LoadableEntry(entry) : entry.content}</Entry>}
  />
)
export default () => (
  <div className="content">
    <Routes>
      <Route path="/" element={<Home />}>
        <Route
          index
          element={
            <div className="container-fluid">
              <div className="entry">
                <GitHubActivity />
              </div>
            </div>
          }
        />
        <Route path="posts/:category?" element={<SummaryList />} />
        {parsedEntries.all.map(entryRoute)}
      </Route>
    </Routes>
  </div>
)
