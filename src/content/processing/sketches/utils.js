export function getBackgroundColor() {
  const parentStyle = window.getComputedStyle(document.querySelector('.Showcase'))
  return parentStyle.backgroundColor
}

export function windowResized(p, heightRatio, onSizeChange) {
  return () => {
    const parentStyle = window.getComputedStyle(document.querySelector('.Showcase'))
    const width = p.int(
      parseFloat(parentStyle.width) - parseFloat(parentStyle.paddingLeft) - parseFloat(parentStyle.paddingRight),
    )
    p.resizeCanvas(width, p.int(width * heightRatio))
    onSizeChange?.()
  }
}
