import index from 'virtual:manual-search'

export function searchManual(query: string) {
  const name = query.trim().toLowerCase()
  const hits = index.search(name, { prefix: (term, i, terms) => term.length >= 2 && i === terms.length - 1 })
  const exact = (hit: (typeof hits)[number]) => hit.title.toLowerCase() === name || hit.alias.toLowerCase() === name
  hits.sort((a, b) => Number(exact(b)) - Number(exact(a)))
  const titleCounts = new Map<string, number>()
  for (const { title } of hits) titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1)
  const suggestion = hits.length
    ? undefined
    : index.autoSuggest(name, { prefix: false, fuzzy: (term) => (term.length >= 3 ? 1 : false) })[0]?.suggestion
  return { hits, suggestion, titleCounts, name }
}
