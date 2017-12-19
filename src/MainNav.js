import React, { Component } from 'react'
import { MenuItem, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'

class MainNav extends Component {
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
            <NavDropdown title="Processing" id="processing">
              <LinkContainer to="/processing/retrograde_motion">
                <MenuItem>Retrograde motion</MenuItem>
              </LinkContainer>
              <LinkContainer to="/processing/string_pluck">
                <MenuItem>String pluck</MenuItem>
              </LinkContainer>
              <LinkContainer to="/processing/snow_globe">
                <MenuItem>Snow globe</MenuItem>
              </LinkContainer>
              <LinkContainer to="/processing/force_graph">
                <MenuItem>Force-directed graphs</MenuItem>
              </LinkContainer>
              <LinkContainer to="/processing/bubble_wrap">
                <MenuItem>Bubble Wrap</MenuItem>
              </LinkContainer>
            </NavDropdown>
            <NavDropdown title="Music generation" id="music_generation">
              <LinkContainer to="/music_generation/midi_markov">
                <MenuItem>MIDI Markov</MenuItem>
              </LinkContainer>
              <LinkContainer to="/music_generation/auto_sampler">
                <MenuItem>AutoSampler</MenuItem>
              </LinkContainer>
            </NavDropdown>
            <NavDropdown title="Audio DSP" id="audio_dsp">
              <LinkContainer to="/audio_dsp/jupyter_notebooks">
                <MenuItem>Jupyter notebooks</MenuItem>
              </LinkContainer>
            </NavDropdown>
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
