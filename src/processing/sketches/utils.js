export function getBackgroundColor(parentId) {
  const parentStyle = window.getComputedStyle(document.getElementById(parentId))
  return parentStyle.backgroundColor
}

export function copyArray(array) {
  const arrayCopy = []
  for (let i = 0; i < array.length; i++) {
    arrayCopy[i] = array[i]
  }
  return arrayCopy
}
