import entries from './entries'
import { snakeCaseToTitle, stripSlashes } from './utils'

const reverseChronological = entries
  .filter((entry) => entry.date)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.path.localeCompare(a.path))

const categoryPath = (entry) => stripSlashes(entry.path).split('/')[0]
const categories = [...new Set(reverseChronological.map(categoryPath))].sort().map((path) => {
  const posts = reverseChronological.filter((entry) => categoryPath(entry) === path)
  return {
    path,
    title: stripSlashes(posts[0].path) === path ? posts[0].title : snakeCaseToTitle(path),
    posts,
  }
})

export default {
  all: entries,
  categories,
  reverseChronological,
}
