import { InternalLink, normalizePath, withinPath } from 'navigation'
import parsedEntries from 'parsedEntries'
import { manualHome, meshEditorHome } from 'config'

const meshEditorPages = [
  [manualHome, 'Manual'],
  [meshEditorHome + 'render', 'Render gallery'],
]

function tab(href: string, label: string, current: boolean, within = false) {
  return (
    <InternalLink key={href} href={href} aria-current={current ? 'page' : within ? 'location' : undefined}>
      {label}
    </InternalLink>
  )
}

export default function PageNav({ pathname }: { pathname: string }) {
  const viewingMeshEditor = withinPath(pathname, normalizePath(meshEditorHome))
  const category = parsedEntries.categories.find(
    (category) =>
      pathname === normalizePath(`/posts/${category.path}`) || category.posts.some((post) => normalizePath(post.path) === pathname),
  )?.path
  const viewingPosts = withinPath(pathname, '/posts') || !!category

  return (
    <>
      <nav className="home-views" aria-label="Home views">
        {tab('/', 'GitHub activity', pathname === '/')}
        {tab('/posts', 'Posts', viewingPosts)}
        {tab(manualHome, 'MeshEditor', pathname === normalizePath(manualHome), viewingMeshEditor)}
      </nav>
      {viewingPosts && (
        <nav className="section-views" aria-label="Post categories">
          {tab('/posts', 'All', !category)}
          {parsedEntries.categories.map(({ path, title }) => tab(`/posts/${path}`, title, path === category))}
        </nav>
      )}
      {viewingMeshEditor && (
        <nav className="section-views" aria-label="MeshEditor sections">
          {meshEditorPages.map(([href, label]) => {
            const path = normalizePath(href)
            return tab(href, label, pathname === path, withinPath(pathname, path))
          })}
        </nav>
      )}
    </>
  )
}
