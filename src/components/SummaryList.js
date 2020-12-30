import React from 'react'
import { Link } from 'react-router-dom'
import { Card, Container, Row, Col } from 'react-bootstrap'
import Helmet from 'react-helmet'

import config from '../config'
import parsedEntries from '../parsedEntries'

function Panel({ entry }) {
  return (
    <Link to={entry.path} key={entry.path} className="panelLink">
      <Card>
        <Card.Header>
          <div>
            <h1>{entry.summaryTitle || entry.title}</h1>
            {entry.subtitle && <h2 className="subtitle">{entry.subtitle}</h2>}
            <h3 className="date">{entry.date}</h3>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mainContent">{entry.description}</div>
        </Card.Body>
      </Card>
    </Link>
  )
}

export default function SummaryList() {
  return (
    <Container>
      {config && config.siteTitle && <Helmet title={config.siteTitle} />}
      <Row>
        <Col className="justify-content-md-center">
          {parsedEntries.reverseChronological.map(entry => <Panel key={entry.title} entry={entry} />)}
        </Col>
      </Row>
    </Container>
  )
}
