import React, { Component } from 'react'

import MainNav from './MainNav'
import MainContent from './MainContent'

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showSidebar: false,
    }
  }

  toggleSidebar = () => {
    this.setState({ showSidebar: !this.state.showSidebar })
  }

  render() {
    return (
      <div>
        <MainNav onShowSidebarClicked={this.toggleSidebar} />
        <MainContent showSidebar={this.state.showSidebar} />
      </div>
    )
  }
}
