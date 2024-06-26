import { windowResized } from './utils'

export default function sketch(p) {
  let numX = 20
  let numY = 20

  p.windowResized = windowResized(p, 0.25)

  p.setup = () => {
    const cnv = p.createCanvas(600, 400)
    p.noStroke()
    p.windowResized()

    cnv.mouseClicked(() => {
      numX = p.map(p.mouseX, 0, p.width, p.width / 230, p.width / 4)
      numY = p.map(p.mouseY, 0, p.height, p.height / 230, p.height / 4)
    })
  }

  p.draw = () => {
    p.background(parseInt(p.frameCount / 255, 10) % 2 === 0 ? p.frameCount % 255 : 255 - (p.frameCount % 255))

    const circleSize = p.map(p.mouseX, 0, p.width, p.width / 500, p.width / 20)
    const speed = p.map(p.mouseY, 0, p.height, 0.06, 0.2)
    for (let x = 0; x < p.width + 10; x += numX) {
      for (let y = 0; y < p.height + 10; y += numY) {
        p.fill(
          255 * Math.cos(x + y + p.frameCount * 0.01),
          255 * Math.sin(y + x + p.frameCount * 0.01),
          255 * Math.tan(x + y + p.frameCount * 0.01),
        )
        p.ellipse(
          x,
          y,
          circleSize * Math.sin(x + y + p.frameCount * speed) + 8,
          circleSize * Math.cos(x + y + p.frameCount * speed) + 8,
        )
      }
    }
  }
}
