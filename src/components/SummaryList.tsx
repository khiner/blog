import { Link } from 'react-router-dom'
import { Card, Container, Row, Col } from 'react-bootstrap'
import { HelmetProvider, Helmet } from 'react-helmet-async'

import config from 'config'
import parsedEntries from 'parsedEntries'

const Panel = ({ entry }) => (
  <Card>
    <Link to={entry.path} key={entry.path} className="panelLink">
      <Card.Header>
        <div>
          <h1>{entry.summaryTitle || entry.title}</h1>
          {entry.subtitle && <h2 className="subtitle">{entry.subtitle}</h2>}
          <h3 className="date">{entry.date}</h3>
        </div>
      </Card.Header>
    </Link>
    <Card.Body>
      <div className="mainContent">{entry.description}</div>
    </Card.Body>
  </Card>
)

export default (
  <HelmetProvider>
    <Container>
      {config?.siteName && (
        <Helmet>
          <title>{config.siteName}</title>
        </Helmet>
      )}
      <Row>
        <Col className="justify-content-md-center">
          {parsedEntries.reverseChronological.map((entry) => (
            <Panel key={entry.title} entry={entry} />
          ))}
        </Col>
      </Row>
    </Container>
  </HelmetProvider>
)
