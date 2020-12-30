import React, { useState } from 'react'
import 'highlight.js/styles/atom-one-dark.css' // TODO delete?

import MainNav from './MainNav'
import MainContent from './MainContent'

import '../style/App.scss'

// TODO: only add mathJax for Jupyter notebooks (or somehow make a package.json dep instead)
export default function App() {
  const [shouldShowSidebar, setShouldShowSidebar] = useState(false);

  const toggleSidebar = () => setShouldShowSidebar(!shouldShowSidebar);

  return (
    <div>
      <MainNav
        shouldShowSidebar={shouldShowSidebar}
        onShowSidebarClicked={toggleSidebar}
      />
      <MainContent
        shouldShowSidebar={shouldShowSidebar}
        toggleSidebar={toggleSidebar}
      />
    </div>
  )
}
