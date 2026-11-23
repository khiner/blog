import { lazy, Suspense } from 'preact/compat'
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { InternalLink, navigate, normalizePath, scrollToFragment, usePathname } from 'navigation'

import SummaryList from './SummaryList'
import PageNav from './PageNav'
import ManualSidebar, { isManualPath, ManualFooter } from './ManualNavigation'
import GitHubActivity from './GitHubActivity'
import Entry from './Entry'
import config, { manualHome, meshEditorHome } from 'config'

import parsedEntries from 'parsedEntries'
import contentComponents, { manualComponents } from 'contentComponents'

function LoadedContent({ children }: { children: ComponentChildren }) {
  const root = useRef<HTMLDivElement>(null)
  // A linked heading becomes available once the MDX entry has mounted.
  useLayoutEffect(scrollToFragment, [])
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
    const path = normalizePath(entry.path)
    const manual = isManualPath(path)
    const Content = lazy(async () => {
      const { default: Component } = await entry.load()
      return {
        default: () => (
          <LoadedContent>
            <Component components={manual ? manualComponents : contentComponents} />
            {manual && <ManualFooter page={entry} />}
          </LoadedContent>
        ),
      }
    })
    return [path, { entry, Content }] as const
  }),
)

export default function MainContent() {
  const pathname = usePathname()
  const postsMatch = pathname.match(/^\/posts(?:\/([^/]+))?$/)
  const category = parsedEntries.categories.find((item) => item.path.toLowerCase() === postsMatch?.[1])
  const invalidCategory = !!postsMatch?.[1] && !category
  let redirect = invalidCategory ? '/posts' : undefined
  if (pathname === normalizePath(meshEditorHome)) redirect = manualHome + window.location.search + window.location.hash
  const entryPage = entryPages.get(pathname)
  const title = pathname === '/' || postsMatch ? null : (entryPage?.entry.title ?? 'Page not found')
  const pageTitle = title ? `${config.siteName} - ${title}` : config.siteName
  useLayoutEffect(() => {
    if (redirect) navigate(redirect, true)
    else document.title = pageTitle
  }, [redirect, pageTitle])
  if (redirect) return null

  let content
  if (pathname === '/') {
    content = (
      <div className="page entry">
        <GitHubActivity />
      </div>
    )
  } else if (postsMatch) {
    content = <SummaryList category={category?.path} />
  } else {
    content = entryPage ? (
      <Entry key={pathname} {...entryPage.entry}>
        <Suspense fallback={<div>Loading...</div>}>
          <entryPage.Content />
        </Suspense>
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
      {isManualPath(pathname) ? (
        <div className="manual-layout">
          <ManualSidebar pathname={pathname} />
          {content}
        </div>
      ) : (
        content
      )}
    </main>
  )
}
