import { isValidElement, lazy, Suspense, useEffect, useLayoutEffect } from 'preact/compat'
import { InternalLink, navigate, normalizePath, usePathname } from 'navigation'

import SummaryList from './SummaryList'
import Home from './Home'
import GitHubActivity from './GitHubActivity'
import Entry from './Entry'
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

const entryPage = (entry) =>
  [
    normalizePath(entry.path),
    <Entry key={entry.path} {...entry}>
      {entry.contentPath ? lazyEntry(entry) : entry.content}
    </Entry>,
  ] as const
const entryPages = new Map(parsedEntries.all.map(entryPage))

export default function MainContent() {
  const pathname = usePathname()
  const postsMatch = pathname.match(/^\/posts(?:\/([^/]+))?$/)
  const category = parsedEntries.categories.find((item) => item.path.toLowerCase() === postsMatch?.[1])
  const invalidCategory = !!postsMatch?.[1] && !category
  const entry = parsedEntries.all.find((entry) => normalizePath(entry.path) === pathname)
  const title = pathname === '/' || postsMatch ? null : entry ? entry.title : 'Page not found'
  const pageTitle = config.siteName && title ? `${config.siteName} - ${title}` : config.siteName || title || ''
  useLayoutEffect(() => {
    document.title = pageTitle
  }, [pageTitle])
  useEffect(() => {
    if (invalidCategory) navigate('/posts', true)
  }, [invalidCategory])

  let content
  if (pathname === '/') {
    content = (
      <div className="page-fluid">
        <div className="entry">
          <GitHubActivity />
        </div>
      </div>
    )
  } else if (postsMatch) {
    content = invalidCategory ? null : <SummaryList category={category?.path} />
  } else {
    content = entryPages.get(pathname) ?? (
      <div className="page-width entry">
        <h1>Page not found</h1>
        <InternalLink href="/">Return home</InternalLink>
      </div>
    )
  }

  return (
    <div className="content">
      <Home pathname={pathname}>{content}</Home>
    </div>
  )
}
