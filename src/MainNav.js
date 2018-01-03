import React, { Component } from 'react'
import { MenuItem, Nav, NavItem, Navbar, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'

import config from './config'
import { snakeCaseToTitle, stripSlashes } from './utils'
import parsedEntries from './parsedEntries'

import MailChimpEmailSignup from './follow_and_share/MailChimpEmailSignup'

export default class MainNav extends Component {
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
            {parsedEntries.uniqueTopLevelPathSegments
              .sort()
              .map(topLevelPathSegment => {
                if (
                  parsedEntries.nestedTopLevelPathSegments.indexOf(
                    topLevelPathSegment
                  ) !== -1
                ) {
                  return this.generateNavDropdown(topLevelPathSegment)
                } else {
                  const entry =
                    parsedEntries.byTopLevelPathSegment[topLevelPathSegment]
                  return this.wrapInLink(this.generateNavItem(entry), entry)
                }
              })}
          </Nav>
          {config.email && (
            <Nav pullRight>
              <NavDropdown title="Contact" id="contact">
                <MenuItem
                  href={`mailto:${config.email}?Subject=Hello!`}
                  target="_blank">
                  {config.email}
                </MenuItem>
              </NavDropdown>
            </Nav>
          )}
          {config.mailChimpFormAction &&
            config.mailChimpInputName && (
              <Nav pullRight>
                <NavDropdown title="Subscribe" id="subscribe">
                  <MailChimpEmailSignup
                    formAction={config.mailChimpFormAction}
                    inputName={config.mailChimpInputName}
                  />
                </NavDropdown>
              </Nav>
            )}
        </Navbar.Collapse>
      </Navbar>
    )
  }
}
