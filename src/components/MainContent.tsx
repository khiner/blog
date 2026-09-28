import { isValidElement, lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import SummaryList from './SummaryList'
import Home from './Home'
import GitHubActivity from './GitHubActivity'
import Entry from './Entry'
import { stripSlashes } from 'utils'
import config from 'config'

import parsedEntries from 'parsedEntries'

const modules = import.meta.glob<{ default: any }>('../content/**/*.tsx')

const lazyEntry = (entry) => {
  const Content = lazy(async () => {
    const imported = await modules[`../content/${entry.contentPath}.tsx`]()
    const Component = imported.default
    const element = isValidElement(Component) ? Component : <Component />
    return { default: () => <div id="loadedContent">{element}</div> }
  })
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  )
}

const entryRoute = (entry) => (
  <Route
    key={entry.path}
    path={`/${stripSlashes(entry.path)}`}
    element={<Entry {...entry}>{entry.contentPath ? lazyEntry(entry) : entry.content}</Entry>}
  />
)
const entryRoutes = parsedEntries.all.map(entryRoute)

export default () => (
  <div className="content">
    <Routes>
      <Route path="/" element={<Home />}>
        <Route
          index
          element={
            <div className="page-fluid">
              <div className="entry">
                <GitHubActivity />
              </div>
            </div>
          }
        />
        <Route path="posts/:category?" element={<SummaryList />} />
        {entryRoutes}
      </Route>
      <Route path="*" element={<title>{config.siteName}</title>} />
    </Routes>
  </div>
)
