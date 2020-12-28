import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Card, Container, Row, Col } from 'react-bootstrap'
import Helmet from 'react-helmet'

import config from '../config'
import parsedEntries from './parsedEntries'

export default class SummaryList extends Component {
  header(entry) {
    return (
      <div>
        <h1>{entry.summaryTitle || entry.title}</h1>
        {entry.subtitle && <h2 className="subtitle">{entry.subtitle}</h2>}
        <h3 className="date">{entry.date}</h3>
      </div>
    )
  }

  panel(entry) {
    return (
      <Link to={entry.path} key={entry.path} className="panelLink">
        <Card>
          <Card.Header>{this.header(entry)}</Card.Header>
          <Card.Body>
            <div className="mainContent">{entry.description}</div>
          </Card.Body>
        </Card>
      </Link>
    )
  }

  render() {
    return (
      <Container>
        {config && config.siteTitle && <Helmet title={config.siteTitle} />}
        <Row>
          <Col className="justify-content-md-center">
            {parsedEntries.reverseChronological.map(entry => this.panel(entry))}
          </Col>
        </Row>
      </Container>
    )
  }
}
