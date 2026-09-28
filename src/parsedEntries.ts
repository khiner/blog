import config from './config'
import entries from './entries'
import { stripSlashes } from './utils'

// decorate all entries with full urls
if (config.origin) {
  entries.forEach((entry) => {
    entry.url = `${stripSlashes(config.origin)}/${stripSlashes(entry.path)}`
  })
}

const reverseChronological = entries
  .filter((entry) => entry.date)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

const strippedPaths = reverseChronological.map((entry) => stripSlashes(entry.path))

const findUniqueTopLevelPathSegments = () => [...new Set(strippedPaths.map((path) => path.split('/')[0]))]
const findNestedTopLevelPathSegments = () =>
  strippedPaths.filter((path) => path.split('/').length > 1).map((path) => path.split('/')[0])

const uniqueTopLevelPathSegments = findUniqueTopLevelPathSegments()
const nestedTopLevelPathSegments = findNestedTopLevelPathSegments()
const byTopLevelPathSegment = Object.fromEntries(
  uniqueTopLevelPathSegments.map((topLevelPathSegment) => [
    topLevelPathSegment,
    nestedTopLevelPathSegments.includes(topLevelPathSegment)
      ? reverseChronological.filter((entry) => stripSlashes(entry.path).startsWith(topLevelPathSegment))
      : reverseChronological.find((entry) => stripSlashes(entry.path) === topLevelPathSegment),
  ]),
)

export default {
  all: entries,
  uniqueTopLevelPathSegments,
  nestedTopLevelPathSegments,
  byTopLevelPathSegment,
  reverseChronological,
}
