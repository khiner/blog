import React, { Component } from 'react'
import { MenuItem, Nav, NavItem, Navbar, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'

import config from './config'
import { snakeCaseToTitle, stripSlashes } from './utils'
import parsedEntries from './parsedEntries'

class MainNav extends Component {
  generateMenuItem(entry) {
    return <MenuItem>{entry.title}</MenuItem>
  }

  wrapInLink(content, entry) {
    return (
      <LinkContainer key={entry.path} to={`/${stripSlashes(entry.path)}/`}>
        {content}
      </LinkContainer>
    )
  }

  generateNavItem(entry) {
    return <NavItem>{entry.title}</NavItem>
  }

  generateNavDropdown(topLevelPathSegment) {
    return (
      <NavDropdown
        key={topLevelPathSegment}
        id={topLevelPathSegment}
        title={snakeCaseToTitle(topLevelPathSegment)}>
        {parsedEntries.byTopLevelPathSegment[topLevelPathSegment].map(entry =>
          this.wrapInLink(this.generateMenuItem(entry), entry)
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
            {Object.keys(parsedEntries.byTopLevelPathSegment).map(
              topLevelPathSegment =>
                this.generateNavDropdown(topLevelPathSegment)
            )}
            {parsedEntries.nonNested.map(entry =>
              this.wrapInLink(this.generateNavItem(entry), entry)
            )}
          </Nav>
          {config.email && (
            <Nav pullRight>
              <NavDropdown title="Contact" id="contact">
                <MenuItem>{config.email}</MenuItem>
              </NavDropdown>
            </Nav>
          )}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default MainNav
