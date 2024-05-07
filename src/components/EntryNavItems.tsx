import React from 'react'
import { Nav, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import parsedEntries from '../parsedEntries'
import { snakeCaseToTitle, stripSlashes } from '../utils'

const EntryNavDropdownItem = ({ entry, onItemClick }) => (
  <NavDropdown.Item
    as={Link}
    to={`/${stripSlashes(entry.path)}`}
    onClick={(event) => {
      onItemClick(event)
      history.push(entry.path)
    }}
  >
    {entry.title}
  </NavDropdown.Item>
)

const EntryNavDropdown = ({ topLevelPathSegment, onItemClick }) => (
  <NavDropdown key={topLevelPathSegment} id={topLevelPathSegment} title={snakeCaseToTitle(topLevelPathSegment)}>
    {parsedEntries.byTopLevelPathSegment[topLevelPathSegment]
      .sort((a, b) => (a.date && b.date ? Date.parse(b.date) - Date.parse(a.date) : 1))
      .map((entry) => (
        <EntryNavDropdownItem key={entry.path} entry={entry} onItemClick={onItemClick} />
      ))}
  </NavDropdown>
)

export default ({ onItemClick }) => (
  <Nav className="flex-column">
    {parsedEntries.uniqueTopLevelPathSegments.sort().map((topLevelPathSegment) => {
      const entry = parsedEntries.byTopLevelPathSegment[topLevelPathSegment]
      if (parsedEntries.nestedTopLevelPathSegments.includes(topLevelPathSegment)) {
        return (
          <EntryNavDropdown
            key={topLevelPathSegment}
            topLevelPathSegment={topLevelPathSegment}
            onItemClick={onItemClick}
          />
        )
      }

      return <EntryNavDropdownItem key={entry.title} entry={entry} onItemClick={onItemClick} />
    })}
  </Nav>
)
