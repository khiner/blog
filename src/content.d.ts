declare module 'virtual:entries' {
  const entries: import('./entries').EntryMetadata[]
  export default entries
}

declare module 'virtual:manual-search' {
  const index: import('minisearch').default
  export default index
}

declare module '*.mdx' {
  const Content: import('./entries').ContentComponent
  export default Content
}
