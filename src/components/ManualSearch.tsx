import { useRef, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { SearchIcon } from 'icons'
import { InternalLink } from 'navigation'
import ManualSearchHit from './ManualSearchHit'

export default function ManualSearch({ children, onNavigate }: { children: ComponentChildren; onNavigate: () => void }) {
  const [query, setQuery] = useState('')
  const [engine, setEngine] = useState<typeof import('../searchManual') | 'loading' | 'failed'>()
  const input = useRef<HTMLInputElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const active = Boolean(query.trim())

  function updateQuery(value: string) {
    setQuery(value)
    scroller.current.scrollTop = 0
    if (value.trim() && (!engine || engine === 'failed')) {
      setEngine('loading')
      import('../searchManual').then(setEngine, () => setEngine('failed'))
    }
  }

  function openResult() {
    updateQuery('')
    onNavigate()
  }

  const result = active && typeof engine === 'object' ? engine.searchManual(query) : undefined
  return (
    <>
      <form
        role="search"
        aria-label="MeshEditor manual"
        onSubmit={(event) => {
          event.preventDefault()
          scroller.current?.querySelector<HTMLAnchorElement>('.manual-search-results a')?.click()
        }}
      >
        <label className="manual-search-field">
          <SearchIcon aria-hidden="true" />
          <input
            ref={input}
            type="search"
            aria-label="Search the manual"
            placeholder="Search"
            value={query}
            onInput={(event) => updateQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && query) {
                event.preventDefault()
                event.stopPropagation()
                updateQuery('')
              }
            }}
          />
        </label>
      </form>
      <div className="manual-nav-scroll" ref={scroller}>
        {!active ? (
          children
        ) : result?.hits.length ? (
          <ul className="manual-search-results" aria-label="Search results">
            {result.hits.map((hit) => (
              <li key={hit.id}>
                <InternalLink href={hit.id} onNavigate={openResult}>
                  <ManualSearchHit hit={hit} query={result.name} showPage={result.titleCounts.get(hit.title) > 1} />
                </InternalLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="manual-search-status" role="status">
            {engine === 'failed' ? 'Couldn’t load search.' : result ? 'No results.' : 'Searching…'}
            {result?.suggestion && (
              <>
                {' Did you mean '}
                <button
                  type="button"
                  onClick={() => {
                    updateQuery(result.suggestion)
                    input.current?.focus()
                  }}
                >
                  {result.suggestion}
                </button>
                ?
              </>
            )}
          </p>
        )}
      </div>
    </>
  )
}
