import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { HelmetProvider, Helmet } from 'react-helmet-async'

import config from 'config'
import parsedEntries from 'parsedEntries'

export default function Home() {
  const { pathname } = useLocation()
  const category = parsedEntries.categories.find(
    (category) => pathname === `/posts/${category.path}` || category.posts.some((post) => post.path === pathname),
  )?.path
  const viewingPosts = pathname === '/posts' || pathname.startsWith('/posts/') || !!category

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
          <Link
            to="/posts"
            className={viewingPosts ? 'active' : undefined}
            aria-current={viewingPosts ? 'page' : undefined}
          >
            Posts
          </Link>
          <NavLink to="/MeshEditor/render">MeshEditor renders</NavLink>
        </nav>
        {viewingPosts && (
          <nav className="post-views" aria-label="Post categories">
            {[{ path: '', title: 'All' }, ...parsedEntries.categories].map(({ path, title }) => (
              <Link
                key={path}
                to={path ? `/posts/${path}` : '/posts'}
                className={path === (category ?? '') ? 'active' : undefined}
                aria-current={path === (category ?? '') ? 'page' : undefined}
              >
                {title}
              </Link>
            ))}
          </nav>
        )}
        <Outlet />
      </div>
    </HelmetProvider>
  )
}
