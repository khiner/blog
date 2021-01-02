import React, { useState } from 'react'

import MainNav from './MainNav'
import MainContent from './MainContent'
import Sidebar from './Sidebar'
import config from '../config'

import '../style/App.scss'

// TODO: only add mathJax for Jupyter notebooks (or somehow make a package.json dep instead)
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      {config.entriesInSidebar && (
        <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      )}
      <div
        className={`transitionable${sidebarOpen ? ' opaque' : ''}`}
        onClick={() => setSidebarOpen(false)}
      >
        <MainNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <MainContent />
      </div>
    </div>
  )
}
