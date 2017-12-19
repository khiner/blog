// https://shoffing.wordpress.com/2013/02/22/automatically-scaling-a-processing-js-sketch-to-fit-the-browser-window/comment-page-1/#comment-149

export default function sketch(p) {
  let numX = 20
  let numY = 20

  p.windowResized = function() {
    const parentStyle = window.getComputedStyle(
      document.getElementById('bubble-wrap-parent')
    )
    const setupWidth =
      parseFloat(parentStyle.width) -
      parseFloat(parentStyle.paddingLeft) -
      parseFloat(parentStyle.paddingRight)
    const setupHeight = setupWidth / 4
    p.resizeCanvas(setupWidth, setupHeight)
  }

  p.setup = function() {
    const cnv = p.createCanvas(600, 400)
    p.noStroke()
    p.windowResized()

    cnv.mouseClicked(function() {
      numX = p.map(p.mouseX, 0, p.width, p.width / 230, p.width / 4)
      numY = p.map(p.mouseY, 0, p.height, p.height / 230, p.height / 4)
    })
  }

  p.myCustomRedrawAccordingToNewPropsHandler = function(props) {}

  p.draw = function() {
    const color =
      parseInt(p.frameCount / 255, 10) % 2 === 0
        ? p.frameCount % 255
        : 255 - p.frameCount % 255
    p.background(color)

    for (let x = 0; x < p.width + 10; x += numX) {
      for (let y = 0; y < p.height + 10; y += numY) {
        p.fill(
          255 * Math.cos(x + y + p.frameCount * 0.01),
          255 * Math.sin(y + x + p.frameCount * 0.01),
          255 * Math.tan(x + y + p.frameCount * 0.01)
        )
        p.ellipse(
          x,
          y,
          circleSize() * Math.sin(x + y + p.frameCount * speed()) + 8,
          circleSize() * Math.cos(x + y + p.frameCount * speed()) + 8
        )
      }
    }
  }

  function circleSize() {
    return p.map(p.mouseX, 0, p.width, p.width / 500, p.width / 20)
  }

  function speed() {
    return p.map(p.mouseY, 0, p.height, 0.06, 0.2)
  }
}
