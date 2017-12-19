// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149

function getBackgroundColor() {
  const parentStyle = window.getComputedStyle(
    document.getElementById('string-pluck-parent')
  )
  return parentStyle.backgroundColor
}

export default function sketch(p) {
  var cnv
  const PI_SQUARED = Math.PI * Math.PI
  var parentColor = 100
  const BACKGROUND_COLOR = 'rgb(85, 170, 216)'
  const FOREGROUND_COLOR = 'rgb(221, 250, 252)'

  let plucked = false
  let t = 0 // time since pluck
  let harmonics = 8 // harmonics - each harmonic requires more computation
  let c = 100 // speed
  let amp = 0.0 // amplitude
  var d // x position of pluck
  let damp = 1.1 // damping constant
  let precomputedHarmonics = []
  let isMouseDragging = false // XXX change to use p.mousePressed

  p.windowResized = function() {
    const parentStyle = window.getComputedStyle(
      document.getElementById('string-pluck-parent')
    )
    const setupWidth =
      parseFloat(parentStyle.width) -
      parseFloat(parentStyle.paddingLeft) -
      parseFloat(parentStyle.paddingRight)
    const setupHeight = setupWidth / 4
    p.resizeCanvas(setupWidth, setupHeight)
    onSizeChange()
  }

  function onSizeChange() {
    precomputeHarmonics()
  }

  function precomputeHarmonics() {
    precomputedHarmonics = []
    for (let i = 0; i < harmonics; i++) {
      let m = i + 1
      precomputedHarmonics.push(
        1.0 / (m * m) * Math.sin(PI_SQUARED * m * d / p.width)
      )
    }
  }

  p.setup = function() {
    parentColor = p.color(getBackgroundColor())
    cnv = p.createCanvas(600, 400)
    cnv.mousePressed(function() {
      plucked = false
      t = 0
      amp = p.mouseY - p.height / 2
      d = p.mouseX
      isMouseDragging = true
    })

    cnv.mouseMoved(function() {
      if (isMouseDragging) {
        d = p.mouseX
        amp = p.mouseY - p.height / 2
      }
    })

    cnv.mouseReleased(function() {
      precomputeHarmonics()
      plucked = true
      isMouseDragging = false
    })

    p.strokeWeight(3)
    p.windowResized()
  }

  p.myCustomRedrawAccordingToNewPropsHandler = function(props) {}

  p.draw = function() {
    p.background(parentColor)
    p.noStroke()
    p.fill(BACKGROUND_COLOR)
    p.rect(0, 0, p.width, p.height, p.width / 20.0)
    p.stroke(FOREGROUND_COLOR)

    if (plucked) {
      t++
      amp /= damp
    }

    let w = Math.PI * (c / p.width)
    let yScale =
      1.5 * amp * p.width * p.width / (PI_SQUARED * d * (p.width - d))

    p.beginShape()
    if (plucked) {
      let segmentWidth = p.width / 75.0
      for (let x = 0; x < p.width; x += segmentWidth) {
        let sum = 0
        for (let m = 1; m <= harmonics; m++) {
          sum +=
            precomputedHarmonics[m - 1] *
            Math.cos(w * m * t) *
            Math.sin(Math.PI * m * x / p.width)
        }

        let y = yScale * sum + p.height / 2.0
        p.vertex(x, y)
      }
    } else {
      p.vertex(0, p.height / 2)
      p.vertex(d, p.height / 2 + amp)
      p.vertex(p.width, p.height / 2)
    }
    p.endShape()
  }
}
