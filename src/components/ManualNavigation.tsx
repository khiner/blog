import { useLayoutEffect, useRef, useState } from 'preact/hooks'
import entries, { type EntryMetadata } from 'entries'
import { ListIcon } from 'icons'
import { manualHome } from 'config'
import { InternalLink, normalizePath, withinPath } from 'navigation'
import ManualSearch from './ManualSearch'
import 'style/ManualSidebar.css'

const root = normalizePath(manualHome)
export const isManualPath = (path: string) => withinPath(path, root)

const parentPath = (path: string) => path.slice(0, path.lastIndexOf('/'))
const sections: Record<string, EntryMetadata[]> = {}
for (const entry of entries) {
  const path = normalizePath(entry.path)
  if (path.startsWith(root + '/')) (sections[parentPath(path)] ??= []).push(entry)
}
for (const siblings of Object.values(sections)) {
  siblings.sort((a, b) => (a.navOrder ?? Infinity) - (b.navOrder ?? Infinity) || a.title.localeCompare(b.title))
}

function readingOrder(parent: string): EntryMetadata[] {
  return (sections[parent] ?? []).flatMap((page) => [page, ...readingOrder(normalizePath(page.path))])
}

const ordered = readingOrder(root)

export function ManualFooter({ page }: { page: EntryMetadata }) {
  const position = ordered.indexOf(page)
  if (position < 0) return null
  const parent = parentPath(normalizePath(page.path))
  const section = ordered.find((entry) => normalizePath(entry.path) === parent)
  function link(entry: EntryMetadata | undefined, prefix: string) {
    return (
      entry && (
        <>
          {prefix}
          <InternalLink href={entry.path}>{entry.title}</InternalLink>
        </>
      )
    )
  }
  return (
    <>
      <hr />
      {'\n'}
      <p>
        <InternalLink href={manualHome}>Manual contents</InternalLink>
        {link(section, ' · ')}
        {link(ordered[position + 1], ' · Continue to ')}
      </p>
    </>
  )
}

export default function ManualSidebar({ pathname }: { pathname: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [mobileOpen, setMobileOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const nav = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    setMobileOpen(false)
    const ancestors = Object.keys(sections).filter((path) => withinPath(pathname, path))
    setExpanded((previous) => ({ ...previous, ...Object.fromEntries(ancestors.map((path) => [path, true])) }))
  }, [pathname])

  useLayoutEffect(() => {
    // Scroll just the navigation so a link to a heading keeps its place in the article.
    const frame = requestAnimationFrame(() => {
      const menu = nav.current?.querySelector<HTMLElement>('.manual-nav-scroll')
      const active = menu?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!active?.getClientRects().length) return
      const bounds = menu.getBoundingClientRect()
      const row = active.getBoundingClientRect()
      if (row.bottom > bounds.bottom) menu.scrollTop += row.bottom - bounds.bottom
      else if (row.top < bounds.top) menu.scrollTop -= bounds.top - row.top
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, mobileOpen])

  function closeMenu() {
    if (!mobileOpen) return
    setMobileOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }

  function renderSection(page: EntryMetadata) {
    const path = normalizePath(page.path)
    const label = page.navTitle ?? page.title
    const children = sections[path]
    const open = !!expanded[path]
    const childList = 'manual-children-' + path.slice(root.length + 1).replaceAll('/', '-')
    return (
      <li key={path}>
        <div className="manual-nav-row">
          <InternalLink href={page.path} onNavigate={closeMenu} aria-current={pathname === path ? 'page' : undefined}>
            {label}
          </InternalLink>
          {children && (
            <button
              type="button"
              aria-label={`${open ? 'Collapse' : 'Expand'} ${label}`}
              aria-expanded={open}
              aria-controls={childList}
              onClick={() => setExpanded((previous) => ({ ...previous, [path]: !previous[path] }))}
            />
          )}
        </div>
        {children && (
          <ul id={childList} hidden={!open}>
            {children.map(renderSection)}
          </ul>
        )}
      </li>
    )
  }

  return (
    <aside
      className="manual-sidebar"
      onKeyDown={(event) => {
        if (event.key === 'Escape') closeMenu()
      }}
    >
      <button
        className="manual-menu-toggle"
        type="button"
        ref={trigger}
        aria-expanded={mobileOpen}
        aria-controls="manual-navigation"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <ListIcon aria-hidden="true" /> Manual contents
      </button>
      <nav id="manual-navigation" ref={nav} className={mobileOpen ? 'manual-nav open' : 'manual-nav'} aria-label="MeshEditor manual">
        <InternalLink
          className="manual-home"
          href={manualHome}
          onNavigate={closeMenu}
          aria-current={pathname === root ? 'page' : undefined}
        >
          MeshEditor manual
        </InternalLink>
        <ManualSearch key={pathname} onNavigate={closeMenu}>
          <ul>{sections[root]?.map(renderSection)}</ul>
        </ManualSearch>
      </nav>
    </aside>
  )
}
