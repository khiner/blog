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

export function windowResized(p, parentId, heightRatio, onSizeChange) {
  return function() {
    const parentStyle = window.getComputedStyle(
      document.getElementById(parentId)
    )
    const setupWidth =
      parseFloat(parentStyle.width) -
      parseFloat(parentStyle.paddingLeft) -
      parseFloat(parentStyle.paddingRight)
    const setupHeight = parseInt(setupWidth * heightRatio)
    p.resizeCanvas(setupWidth, setupHeight)
    if (onSizeChange) {
      onSizeChange()
    }
  }
}
