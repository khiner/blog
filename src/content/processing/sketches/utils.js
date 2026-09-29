export function getBackgroundColor() {
  const parentStyle = window.getComputedStyle(document.querySelector('.showcase .entry'))
  return parentStyle.backgroundColor
}

export function windowResized(p, heightRatio, onSizeChange) {
  return () => {
    const parentStyle = window.getComputedStyle(document.querySelector('.showcase .entry'))
    const width = p.int(
      parseFloat(parentStyle.width) - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight),
    )
    p.resizeCanvas(width, p.int(width * heightRatio))
    onSizeChange?.()
  }
}
