const toggleNineties = () => {
  const decadeLabel = document.getElementById('decadeLabel')
  if (!decadeLabel) return

  const enabled = document.body.classList.toggle('nineties')
  decadeLabel.textContent = enabled ? 'sane again' : 'like the 90s'
}

export default toggleNineties
