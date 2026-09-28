import { Link, Navigate, useParams } from 'react-router-dom'
import parsedEntries from 'parsedEntries'

const Panel = ({ entry }) => (
  <div className="post-card">
    <Link to={entry.path} className="panelLink">
      <div className="post-card-header">
        <h1>{entry.summaryTitle || entry.title}</h1>
        {entry.subtitle && <h2 className="subtitle">{entry.subtitle}</h2>}
        <h3 className="date">{entry.date}</h3>
      </div>
    </Link>
    <div className="post-card-body">{entry.description}</div>
  </div>
)

export default function SummaryList() {
  const { category } = useParams()
  const selected = parsedEntries.categories.find((item) => item.path === category)
  if (category && !selected) return <Navigate to="/posts" replace />
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
