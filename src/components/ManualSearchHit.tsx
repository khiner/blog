import type { ComponentChildren } from 'preact'
import type { SearchResult } from 'minisearch'

type Match = { start: number; end: number; term: string }

// MiniSearch splits words at spaces and punctuation, including underscores in identifiers.
function matches(text: string, terms: Map<string, string>) {
  const found: Match[] = []
  for (const word of text.matchAll(/[^\n\r\p{Z}\p{P}]+/gu)) {
    const term = terms.get(word[0].toLowerCase())
    if (term) found.push({ start: word.index, end: word.index + word[0].length, term })
  }
  return found
}

function highlight(text: string, found: Match[]) {
  const parts: ComponentChildren[] = []
  let end = 0
  for (const { start, term } of found) {
    parts.push(text.slice(end, start), <mark>{text.slice(start, start + term.length)}</mark>)
    end = start + term.length
  }
  return [...parts, text.slice(end)]
}

function excerpt(body: string, terms: Map<string, string>, wanted: Set<string>) {
  let best = ''
  let score = 0
  for (const sentence of body.split(/\n+|(?<=[.!?])\s+/u)) {
    const found = matches(sentence, terms).filter(({ term }) => wanted.has(term))
    const count = new Set(found.map(({ term }) => term)).size
    if (count <= score) continue
    // Leave enough room for the match to appear even in a narrow sidebar.
    const { start, end } = found[0]
    const before = sentence.slice(0, start)
    const after = sentence.slice(end)
    const left = before.length > 24 ? '…' + before.slice(-24).replace(/^\S*\s*/, '') : before
    const right = after.length > 56 ? after.slice(0, 56).replace(/\s+\S*$/, '') + '…' : after
    best = left + sentence.slice(start, end) + right
    score = count
    if (count === wanted.size) break
  }
  return highlight(best, matches(best, terms))
}

export default function ManualSearchHit({ hit, query, showPage }: { hit: SearchResult; query: string; showPage: boolean }) {
  // Use the index's matched terms so a prefix highlights only the letters the reader typed.
  const typed = [...hit.queryTerms].sort((a, b) => b.length - a.length)
  const terms = new Map(hit.terms.map((word) => [word, typed.find((term) => word.startsWith(term))]))
  const title = matches(hit.title, terms)
  const missing = new Set(typed)
  for (const { term } of title) missing.delete(term)

  const alias = matches(hit.alias, terms)
  const showAlias =
    alias.some(({ term }) => missing.has(term)) ||
    (hit.alias.toLowerCase() === query && hit.alias.toLowerCase() !== hit.title.toLowerCase())
  const aliasText = showAlias && highlight(hit.alias, alias)

  return (
    <>
      {highlight(hit.title, title)}
      {showAlias ? (
        <small>{hit.page ? <code>{aliasText}</code> : aliasText}</small>
      ) : (
        missing.size > 0 && <small className="manual-search-excerpt">{excerpt(hit.body, terms, missing)}</small>
      )}
      {showPage && hit.page && <small>{hit.page}</small>}
    </>
  )
}
