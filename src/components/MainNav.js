import React from 'react'
import { Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { FaList } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import config from '../config'

import EntryNavItems from './EntryNavItems'
import MailChimpEmailSignup from './follow_and_share/MailChimpEmailSignup'
import ShareButtons from './follow_and_share/ShareButtons'

export default function MainNav({ shouldShowSidebar, onShowSidebarClicked }) {
  return (
    <Navbar fixed="top" expand="md">
      {config.entriesInSidebar && (
        <FaList
          className={`clickable${shouldShowSidebar ? ' active' : ''}`}
          onClick={onShowSidebarClicked}
        />
      )}
      <Navbar.Brand className={config.entriesInSidebar ? 'leaveLeftSpace' : ''}>
        <Link to="/">{config.siteName}</Link>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        {!config.entriesInSidebar && <EntryNavItems />}
        <Nav>
          {config.topLevelLinks &&
            config.topLevelLinks.map((topLevelLink) => (
              <Nav.Link
                key={topLevelLink.label}
                href={topLevelLink.href}
                target="_blank"
              >
                {topLevelLink.label}
              </Nav.Link>
            ))}
          {(config.showShareNavItem ||
            (config.mailChimpFormAction && config.mailChimpInputName)) && (
            <NavDropdown
              title={
                config.showShareNavItem &&
                config.mailChimpFormAction &&
                config.mailChimpInputName
                  ? 'Share & Subscribe'
                  : config.showShareNavItem
                  ? 'Share'
                  : 'Subscribe'
              }
              id="share-and-subscribe"
              alignRight
            >
              {config.showShareNavItem && config.host && (
                <ShareButtons
                  title={config.shareName || config.siteName}
                  description={`${config.shareName || config.siteName}`}
                  url={config.host}
                  hideLabel={true}
                />
              )}
              {config.mailChimpFormAction && config.mailChimpInputName && (
                <MailChimpEmailSignup
                  formAction={config.mailChimpFormAction}
                  inputName={config.mailChimpInputName}
                />
              )}
            </NavDropdown>
          )}
          {config.email && (
            <NavDropdown title="Contact" id="contact" alignRight>
              <Nav.Link
                href={`mailto:${config.email}?Subject=Hello!`}
                target="_blank"
              >
                {config.email}
              </Nav.Link>
            </NavDropdown>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
