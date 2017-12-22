import entries from './entries'
import { stripSlashes } from './utils'

function findUniqueTopLevelPathSegments() {
  return [
    ...new Set(
      entries
        .map(entry => stripSlashes(entry.path))
        .filter(path => path.split('/').length > 1)
        .map(path => path.split('/')[0])
    ),
  ]
}

function findNonNested() {
  return entries.filter(
    entry => stripSlashes(entry.path).split('/').length === 1
  )
}

const uniqueTopLevelPathSegments = findUniqueTopLevelPathSegments()
const nonNested = findNonNested()
const byTopLevelPathSegment = {}
uniqueTopLevelPathSegments.forEach(topLevelPathSegment => {
  byTopLevelPathSegment[topLevelPathSegment] = entries.filter(entry =>
    stripSlashes(entry.path).startsWith(topLevelPathSegment)
  )
})
const reverseChronological = entries
  .filter(entry => entry.date)
  .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

export default {
  byTopLevelPathSegment,
  nonNested,
  reverseChronological,
}
