import React, { Component } from 'react'
import { FaTimes } from 'react-icons/fa';

import EntryNavItems from './EntryNavItems'

export default class Sidebar extends Component {
  render() {
    return (
      <div className={`sidebar${this.props.shouldShowSidebar ? ' show' : ''}`}>
        <div className="sidebarHeader">
          <a style={{float: 'right'}}>
            <FaTimes onClick={this.props.toggle} />
          </a>
          <h3>Posts</h3>
        </div>
        <EntryNavItems onItemClick={this.props.toggle} />
      </div>
    )
  }
}
