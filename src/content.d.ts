declare module 'virtual:entries' {
  const entries: import('./entries').EntryMetadata[]
  export default entries
}

declare module '*.mdx' {
  const Content: import('./entries').ContentComponent
  export default Content
}
