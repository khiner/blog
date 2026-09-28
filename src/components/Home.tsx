import { NavLink, Outlet } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'

import config from 'config'

export default function Home() {
  return (
    <HelmetProvider>
      <div className="summary">
        {config.siteName && (
          <Helmet>
            <title>{config.siteName}</title>
          </Helmet>
        )}
        <nav className="home-views" aria-label="Home views">
          <NavLink to="/" end>
            GitHub activity
          </NavLink>
          <NavLink to="/posts">Posts</NavLink>
        </nav>
        <Outlet />
      </div>
    </HelmetProvider>
  )
}
