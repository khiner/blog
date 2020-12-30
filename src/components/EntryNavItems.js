import React, { Component } from 'react'
import { Nav, NavDropdown } from 'react-bootstrap'

import parsedEntries from '../parsedEntries'
import { snakeCaseToTitle, stripSlashes } from '../utils'

export default class EntryNavItems extends Component {
  generateNavItem(entry) {
    return (
      <NavDropdown.Item
        key={entry.title}
        href={`/${stripSlashes(entry.path)}/`}
        onClick={this.props.onItemClick}>
        {entry.title}
      </NavDropdown.Item>
    )
  }

  generateNavDropdown(topLevelPathSegment) {
    return (
      <NavDropdown
        key={topLevelPathSegment}
        id={topLevelPathSegment}
        title={snakeCaseToTitle(topLevelPathSegment)}>
        {parsedEntries.byTopLevelPathSegment[topLevelPathSegment]
          .sort(
            (a, b) =>
              a.date && b.date ? Date.parse(b.date) - Date.parse(a.date) : 1
          )
          .map(entry => this.generateNavItem(entry))}
      </NavDropdown>
    )
  }

  render() {
    return (
      <Nav className="flex-column">
        {parsedEntries.uniqueTopLevelPathSegments
          .sort()
          .map(topLevelPathSegment => {
            const entry =
              parsedEntries.byTopLevelPathSegment[topLevelPathSegment]
            if (
              parsedEntries.nestedTopLevelPathSegments.indexOf(
                topLevelPathSegment
              ) !== -1
            ) {
              return this.generateNavDropdown(topLevelPathSegment)
            } else {
              return this.generateNavItem(entry)
            }
          })}
      </Nav>
    )
  }
}
