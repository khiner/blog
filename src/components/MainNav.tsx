import React from 'react'
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { FaList } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import config from '../config'
import MailChimpEmailSignup from './MailChimpEmailSignup'

export default ({ sidebarOpen, setSidebarOpen }) => (
  <Navbar fixed="top" expand="lg" variant="dark">
    <FaList
      className={`clickable${sidebarOpen ? ' active' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        setSidebarOpen(!sidebarOpen)
      }}
    />
    <Navbar.Brand style={{ marginLeft: '2em' }}>
      <Link to="/">{config.siteName}</Link>
    </Navbar.Brand>
    <Navbar.Toggle />
    <Navbar.Collapse className="justify-content-end">
      <Nav activeKey={location.pathname}>
        {config.topLevelLinks &&
          config.topLevelLinks.map((topLevelLink) => (
            <Nav.Link key={topLevelLink.label} href={topLevelLink.href} target="_blank">
              {topLevelLink.label}
            </Nav.Link>
          ))}
        {config.mailChimpFormAction && config.mailChimpInputName && (
          <NavDropdown title="Subscribe" id="subscribe" align="end">
            {config.mailChimpFormAction && config.mailChimpInputName && (
              <MailChimpEmailSignup formAction={config.mailChimpFormAction} inputName={config.mailChimpInputName} />
            )}
          </NavDropdown>
        )}
        {config.email && (
          <NavDropdown title="Contact" id="contact" align="end">
            <Nav.Link href={`mailto:${config.email}?Subject=Hello!`} target="_blank">
              {config.email}
            </Nav.Link>
          </NavDropdown>
        )}
      </Nav>
    </Navbar.Collapse>
  </Navbar>
)
