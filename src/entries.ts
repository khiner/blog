import type { ComponentType } from 'preact'
import entries from 'virtual:entries'

export interface EntryMetadata {
  path: string
  title: string
  summaryTitle?: string
  subtitle?: string
  date?: string
  showcase?: boolean
  fullWidth?: boolean
  hideTitle?: boolean
  load: () => Promise<{ default: ContentComponent }>
  Summary?: ContentComponent
}

export type ContentComponent = ComponentType<{ components: typeof import('./contentComponents').default }>

export default entries
