import entries from '../entries'
import { stripSlashes } from '../app/utils'

const strippedPaths = entries.map(entry => stripSlashes(entry.path))

function findUniqueTopLevelPathSegments() {
  return [...new Set(strippedPaths.map(path => path.split('/')[0]))]
}

function findNestedTopLevelPathSegments() {
  return strippedPaths
    .filter(path => path.split('/').length > 1)
    .map(path => path.split('/')[0])
}

const uniqueTopLevelPathSegments = findUniqueTopLevelPathSegments()
const nestedTopLevelPathSegments = findNestedTopLevelPathSegments()
const byTopLevelPathSegment = {}
uniqueTopLevelPathSegments.forEach(topLevelPathSegment => {
  if (nestedTopLevelPathSegments.indexOf(topLevelPathSegment) !== -1) {
    byTopLevelPathSegment[topLevelPathSegment] = entries.filter(entry =>
      stripSlashes(entry.path).startsWith(topLevelPathSegment)
    )
  } else {
    byTopLevelPathSegment[topLevelPathSegment] = entries.find(
      entry => stripSlashes(entry.path) === topLevelPathSegment
    )
  }
})

const reverseChronological = entries
  .filter(entry => entry.date)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

export default {
  uniqueTopLevelPathSegments,
  nestedTopLevelPathSegments,
  byTopLevelPathSegment,
  reverseChronological,
}
