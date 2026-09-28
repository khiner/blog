import { Link, Navigate, useParams } from 'react-router-dom'
import { Card, Container, Row, Col } from 'react-bootstrap'
import parsedEntries from 'parsedEntries'

const Panel = ({ entry }) => (
  <Card>
    <Link to={entry.path} className="panelLink stretched-link">
      <Card.Header>
        <h1>{entry.summaryTitle || entry.title}</h1>
        {entry.subtitle && <h2 className="subtitle">{entry.subtitle}</h2>}
        <h3 className="date">{entry.date}</h3>
      </Card.Header>
    </Link>
    <Card.Body>{entry.description}</Card.Body>
  </Card>
)

export default function SummaryList() {
  const { category } = useParams()
  const selected = parsedEntries.categories.find((item) => item.path === category)
  if (category && !selected) return <Navigate to="/posts" replace />
  const posts = selected?.posts ?? parsedEntries.reverseChronological
  return (
    <Container>
      <Row>
        <Col className="justify-content-md-center">
          {posts.map((entry) => (
            <Panel key={entry.title} entry={entry} />
          ))}
        </Col>
      </Row>
    </Container>
  )
}
