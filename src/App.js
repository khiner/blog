import React, { Component } from 'react'
import 'highlight.js/styles/atom-one-dark.css'

import MainNav from './MainNav'
import MainContent from './MainContent'

import './style/App.scss'

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      shouldShowSidebar: false,
    }

    this.toggleSidebar = this.toggleSidebar.bind(this) // arrow functions not working after eslint update.
  }

  componentDidMount() {
    // TODO: only add mathJax for Jupyter notebooks (or somehow make a package.json dep instead)
  }

  toggleSidebar() {
    this.setState({ shouldShowSidebar: !this.state.shouldShowSidebar })
  }

  render() {
    return (
      <div>
        <MainNav
          shouldShowSidebar={this.state.shouldShowSidebar}
          onShowSidebarClicked={this.toggleSidebar}
        />
        <MainContent
          shouldShowSidebar={this.state.shouldShowSidebar}
          toggleSidebar={this.toggleSidebar}
        />
      </div>
    )
  }
}
