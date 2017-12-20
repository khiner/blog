export function getBackgroundColor(parentId) {
  const parentStyle = window.getComputedStyle(document.getElementById(parentId))
  return parentStyle.backgroundColor
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
    const setupHeight = parseInt(setupWidth * heightRatio, 10)
    p.resizeCanvas(setupWidth, setupHeight)
    if (onSizeChange) {
      onSizeChange()
    }
  }
}
