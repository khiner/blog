import { lazy, Suspense } from 'preact/compat'
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { InternalLink, navigate, normalizePath, usePathname } from 'navigation'

import SummaryList from './SummaryList'
import PageNav from './PageNav'
import GitHubActivity from './GitHubActivity'
import Entry from './Entry'
import config from 'config'

import parsedEntries from 'parsedEntries'
import contentComponents from 'contentComponents'

function LoadedContent({ children }: { children: ComponentChildren }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const typeset = () => {
      window.MathJax?.typesetPromise?.([root.current]).catch((err) => console.error('Error typesetting math:', err))
    }
    const script = document.getElementById('MathJax-script')
    if (window.MathJax?.typesetPromise) typeset()
    else script?.addEventListener('load', typeset, { once: true })
    return () => script?.removeEventListener('load', typeset)
  }, [])
  return (
    <div id="loadedContent" ref={root}>
      {children}
    </div>
  )
}

const entryPages = new Map(
  parsedEntries.all.map((entry) => {
    const Content = lazy(async () => {
      const { default: Component } = await entry.load()
      return {
        default: () => (
          <LoadedContent>
            <Component components={contentComponents} />
          </LoadedContent>
        ),
      }
    })
    return [
      normalizePath(entry.path),
      {
        entry,
        content: (
          <Suspense fallback={<div>Loading...</div>}>
            <Content />
          </Suspense>
        ),
      },
    ] as const
  }),
)

export default function MainContent() {
  const pathname = usePathname()
  const postsMatch = pathname.match(/^\/posts(?:\/([^/]+))?$/)
  const category = parsedEntries.categories.find((item) => item.path.toLowerCase() === postsMatch?.[1])
  const invalidCategory = !!postsMatch?.[1] && !category
  const entryPage = entryPages.get(pathname)
  const title = pathname === '/' || postsMatch ? null : (entryPage?.entry.title ?? 'Page not found')
  const pageTitle = title ? `${config.siteName} - ${title}` : config.siteName
  useLayoutEffect(() => {
    document.title = pageTitle
  }, [pageTitle])
  useEffect(() => {
    if (invalidCategory) navigate('/posts', true)
  }, [invalidCategory])

  let content
  if (pathname === '/') {
    content = (
      <div className="page entry">
        <GitHubActivity />
      </div>
    )
  } else if (postsMatch) {
    content = invalidCategory ? null : <SummaryList category={category?.path} />
  } else {
    content = entryPage ? (
      <Entry key={pathname} {...entryPage.entry}>
        {entryPage.content}
      </Entry>
    ) : (
      <div className="page post-list entry">
        <h1>Page not found</h1>
        <InternalLink href="/">Return home</InternalLink>
      </div>
    )
  }

  return (
    <main className="content">
      <PageNav pathname={pathname} />
      {content}
    </main>
  )
}
