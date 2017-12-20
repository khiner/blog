import React, { Component } from 'react'
import { MenuItem, Nav, NavItem, Navbar, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'

import { snakeCaseToTitle, stripSlashes } from './utils'
import entries from './entries'

class MainNav extends Component {
  findAllUniqueTopLevelPathSegments() {
    return [
      ...new Set(
        entries
          .map(entry => stripSlashes(entry.path))
          .filter(path => path.split('/').length > 1)
          .map(path => path.split('/')[0])
      ),
    ]
  }

  findAllNonNestedEntries() {
    return entries.filter(
      entry => stripSlashes(entry.path).split('/').length === 1
    )
  }

  findEntriesMatchingTopLevelPathSegment(topLevelPathSegment) {
    return entries.filter(entry =>
      stripSlashes(entry.path).startsWith(topLevelPathSegment)
    )
  }

  generateLink(entry) {
    return (
      <LinkContainer key={entry.path} to={`/${stripSlashes(entry.path)}/`}>
        <MenuItem>{entry.title}</MenuItem>
      </LinkContainer>
    )
  }

  generateNavItem(entry) {
    return (
      <LinkContainer key={entry.path} to={`/${stripSlashes(entry.path)}/`}>
        <NavItem>{entry.title}</NavItem>
      </LinkContainer>
    )
  }

  generateNavDropdown(topLevelPathSegment) {
    return (
      <NavDropdown
        key={topLevelPathSegment}
        id={topLevelPathSegment}
        title={snakeCaseToTitle(topLevelPathSegment)}>
        {this.findEntriesMatchingTopLevelPathSegment(topLevelPathSegment).map(
          entry => this.generateLink(entry)
        )}
      </NavDropdown>
    )
  }

  render() {
    return (
      <Navbar default staticTop collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Karl Hiner</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            {this.findAllUniqueTopLevelPathSegments().map(
              topLevelPathSegment => {
                return this.generateNavDropdown(topLevelPathSegment)
              }
            )}
            {this.findAllNonNestedEntries().map(entry => {
              return this.generateNavItem(entry)
            })}
          </Nav>
          <Nav pullRight>
            <NavDropdown title="Contact" id="contact">
              <MenuItem>Email: karl.hiner@gmail.com</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default MainNav
