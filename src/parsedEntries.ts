import config from './config'
import entries from './entries'
import { snakeCaseToTitle, stripSlashes } from './utils'

// decorate all entries with full urls
if (config.origin) {
  entries.forEach((entry) => {
    entry.url = `${stripSlashes(config.origin)}/${stripSlashes(entry.path)}`
  })
}

const reverseChronological = entries
  .filter((entry) => entry.date)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

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
