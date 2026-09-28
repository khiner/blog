import { useState } from 'react'
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import config from 'config'
import MailChimpEmailSignup from './MailChimpEmailSignup'

export default function MainNav() {
  const [linksOpen, setLinksOpen] = useState(false)

  return (
    <Navbar fixed="top" expand={false} variant="dark" expanded={linksOpen} onToggle={setLinksOpen}>
      <Navbar.Brand>
        <Link to="/">{config.hostname}</Link>
      </Navbar.Brand>
      <Navbar.Toggle
        className="header-menu-toggle"
        label="Links"
        aria-controls="header-links"
        aria-expanded={linksOpen}
      >
        Links
        <svg className="header-menu-chevron" viewBox="0 0 12 8" aria-hidden="true">
          <path d="m1 2 5 4 5-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </Navbar.Toggle>
      <Navbar.Collapse id="header-links" className="justify-content-end">
        <Nav activeKey={location.pathname} className="header-links">
          {config.topLevelLinks?.map((topLevelLink) => (
            <Nav.Link key={topLevelLink.label} href={topLevelLink.href} target="_blank">
              {topLevelLink.label}
            </Nav.Link>
          ))}
          {config.mailChimpFormAction && config.mailChimpInputName && (
            <NavDropdown title="Subscribe" id="subscribe" align="end">
              <MailChimpEmailSignup formAction={config.mailChimpFormAction} inputName={config.mailChimpInputName} />
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
}
