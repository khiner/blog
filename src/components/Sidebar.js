import React from 'react'
import { FaTimes } from 'react-icons/fa';

import EntryNavItems from './EntryNavItems'

export default function Sidebar({ shouldShowSidebar, toggle }) {
  return (
    <div className={`sidebar${shouldShowSidebar ? ' show' : ''}`}>
      <div className="sidebarHeader">
        <FaTimes className="clickable" style={{float: 'right'}} onClick={toggle} />
        <h3>Posts</h3>
      </div>
      <EntryNavItems onItemClick={toggle} />
    </div>
  )
}
