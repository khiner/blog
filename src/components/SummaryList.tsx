import { InternalLink } from 'navigation'
import parsedEntries from 'parsedEntries'

const Panel = ({ entry }) => (
  <div className="post-card">
    <InternalLink href={entry.path} className="panelLink">
      <div className="post-card-header">
        <h1>{entry.summaryTitle || entry.title}</h1>
        {entry.subtitle && <h2 className="subtitle">{entry.subtitle}</h2>}
        <h3 className="date">{entry.date}</h3>
      </div>
    </InternalLink>
    <div className="post-card-body">{entry.description}</div>
  </div>
)

export default function SummaryList({ category }: { category?: string }) {
  const selected = parsedEntries.categories.find((item) => item.path === category)
  const posts = selected?.posts ?? parsedEntries.reverseChronological
  return (
    <div className="page-width">
      <div className="post-row">
        <div className="post-column">
          {posts.map((entry) => (
            <Panel key={entry.title} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  )
}
