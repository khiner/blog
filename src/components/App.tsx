import { useState } from 'react'

import MainNav from './MainNav'
import MainContent from './MainContent'
import Sidebar from './Sidebar'

import 'style/App.scss'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div>
      <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
      <div className={`transitionable${sidebarOpen ? ' opaque' : ''}`} onClick={() => setSidebarOpen(false)}>
        <MainNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <MainContent />
      </div>
    </div>
  )
}
