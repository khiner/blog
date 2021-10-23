import React from 'react'
import { FaTimes } from 'react-icons/fa'

import EntryNavItems from './EntryNavItems'

export default function Sidebar({ isOpen, setOpen }) {
  return (
    <div className={`sidebar${isOpen ? ' show' : ''}`}>
      <div className="sidebarHeader">
        <FaTimes className="clickable" style={{ float: 'right' }} onClick={() => setOpen(!isOpen)} />
        <h3>Posts</h3>
      </div>
      <EntryNavItems onItemClick={() => setOpen(false)} />
    </div>
  )
}
