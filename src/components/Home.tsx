import type { ReactNode } from 'preact/compat'
import { InternalLink, normalizePath } from 'navigation'

import parsedEntries from 'parsedEntries'

export default function Home({ pathname, children }: { pathname: string; children: ReactNode }) {
  const homeMatch = pathname === '/'
  const category = parsedEntries.categories.find(
    (category) =>
      pathname === normalizePath(`/posts/${category.path}`) ||
      category.posts.some((post) => normalizePath(post.path) === pathname),
  )?.path
  const viewingPosts = pathname === '/posts' || pathname.startsWith('/posts/') || !!category

  return (
    <div className="summary">
      <nav className="home-views" aria-label="Home views">
        <InternalLink
          href="/"
          className={homeMatch ? 'active' : undefined}
          aria-current={homeMatch ? 'page' : undefined}
        >
          GitHub activity
        </InternalLink>
        <InternalLink
          href="/posts"
          className={viewingPosts ? 'active' : undefined}
          aria-current={viewingPosts ? 'page' : undefined}
        >
          Posts
        </InternalLink>
        <InternalLink
          href="/MeshEditor/render"
          className={pathname === '/mesheditor/render' ? 'active' : undefined}
          aria-current={pathname === '/mesheditor/render' ? 'page' : undefined}
        >
          MeshEditor renders
        </InternalLink>
      </nav>
      {viewingPosts && (
        <nav className="post-views" aria-label="Post categories">
          {[{ path: '', title: 'All' }, ...parsedEntries.categories].map(({ path, title }) => (
            <InternalLink
              key={path}
              href={path ? `/posts/${path}` : '/posts'}
              className={path === (category ?? '') ? 'active' : undefined}
              aria-current={path === (category ?? '') ? 'page' : undefined}
            >
              {title}
            </InternalLink>
          ))}
        </nav>
      )}
      {children}
    </div>
  )
}
