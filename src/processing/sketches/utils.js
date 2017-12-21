export function getBackgroundColor() {
  const parentStyle = window.getComputedStyle(
    document.querySelector('.Showcase')
  )
  return parentStyle.backgroundColor
}

export function windowResized(p, heightRatio, onSizeChange) {
  return function() {
    const parentStyle = window.getComputedStyle(
      document.querySelector('.Showcase')
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
