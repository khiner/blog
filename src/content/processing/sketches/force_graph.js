import image_asset from '../assets/mario.jpg'

import { getBackgroundColor, windowResized } from './utils'

export default function sketch(p) {
  const DIMENSIONS = 2
  const AXIS_SECTIONS = 5
  const SECTIONS = AXIS_SECTIONS * AXIS_SECTIONS

  let setupFinished = false
  let parentColor = 100

  const imageSections = []

  var network
  var imageToggle, edgesToggle, verticesToggle, pauseToggle
  var toggles

  p.windowResized = windowResized(p, 1, () => {
    network?.onSizeChange()
  })

  p.preload = () => {
    p.loadImage(image_asset, (img) => {
      img.loadPixels()

      let w = img.width / AXIS_SECTIONS
      let h = img.height / AXIS_SECTIONS
      for (let row = 0; row < AXIS_SECTIONS - 1; row++) {
        for (let col = 0; col < AXIS_SECTIONS - 1; col++) {
          imageSections.push(img.get(col * w, row * h, w, h))
        }
      }
    })
  }

  p.setup = () => {
    parentColor = p.color(getBackgroundColor())
    network = new Network()

    const cnv = p.createCanvas(600, 400)
    p.noStroke()
    p.windowResized()

    const toggleDim = p.height / 40,
      toggleOffset = 5
    imageToggle = new Toggle(p.width - 200, 0, toggleDim, toggleDim, 'Image').setEnabled(true)
    edgesToggle = new Toggle(p.width - 200, toggleDim + toggleOffset, toggleDim, toggleDim, 'Edges').setEnabled(true)
    verticesToggle = new Toggle(
      p.width - 200,
      (toggleDim + toggleOffset) * 2,
      toggleDim,
      toggleDim,
      'Vertices',
    ).setEnabled(true)
    pauseToggle = new Toggle(p.width - 400, 0, toggleDim, toggleDim, 'Pause').setEnabled(false)
    toggles = [imageToggle, edgesToggle, verticesToggle, pauseToggle]

    cnv.mousePressed(() => {
      toggles.forEach((toggle) => {
        toggle.mousePressed()
      })
    })

    cnv.mouseReleased(() => {
      toggles.forEach((toggle) => {
        toggle.mouseReleased()
      })
    })

    setupFinished = true
  }

  p.draw = () => {
    if (!setupFinished) return

    p.background(parentColor)
    if (!pauseToggle.enabled) network.step()
    network.draw()
    toggles.forEach((toggle) => {
      toggle.draw()
    })
  }

  class Network {
    constructor() {
      this.k = 0.00006
      this.randomOffset = 0

      this.weights = []
      this.positions = []
      this.velocities = []

      for (let i = 0; i < SECTIONS; i++) {
        this.positions[i] = []
        this.velocities[i] = []
        this.weights[i] = []

        for (let j = 0; j < SECTIONS; j++) {
          this.weights[i][j] = 0
        }

        for (let j = 0; j < DIMENSIONS; j++) {
          this.positions[i][j] = 0
          this.velocities[i][j] = 0
        }
      }

      this.viewCenter = this.positions[p.int(SECTIONS / 2.0)]

      for (let row = 0; row < AXIS_SECTIONS; row++) {
        for (let col = 0; col < AXIS_SECTIONS; col++) {
          if (row > 0) this.setWeight(row, col, row - 1, col, 1)
          if (row < AXIS_SECTIONS - 1) this.setWeight(row, col, row + 1, col, 1)
          if (col > 0) this.setWeight(row, col, row, col - 1, 1)
          if (col < AXIS_SECTIONS - 1) this.setWeight(row, col, row, col + 1, 1)
        }
      }
    }

    onSizeChange() {
      for (let i = 0; i < SECTIONS; i++) {
        let row = parseInt(i / AXIS_SECTIONS, 10)
        let col = i % AXIS_SECTIONS
        this.positions[i][0] = p.width * (col / AXIS_SECTIONS) + p.random(-this.randomOffset, this.randomOffset)
        this.positions[i][1] = p.height * (row / AXIS_SECTIONS) + p.random(-this.randomOffset, this.randomOffset)
      }
    }

    setWeight(row, col, otherRow, otherCol, weight) {
      this.weights[row * AXIS_SECTIONS + col][otherRow * AXIS_SECTIONS + otherCol] = weight
    }

    step() {
      for (let i = 0; i < SECTIONS; i++) {
        for (let j = 0; j < SECTIONS; j++) {
          if (this.weights[i][j] > 0) {
            for (let d = 0; d < DIMENSIONS; d++) {
              this.velocities[i][d] += (this.positions[j][d] - this.positions[i][d] - this.weights[i][j]) * this.k
            }
          }
        }
      }

      for (let i = 0; i < SECTIONS; i++) {
        for (let j = 0; j < SECTIONS; j++) {
          for (let d = 0; d < DIMENSIONS; d++) {
            this.positions[i][d] += this.velocities[i][d]
          }
        }
      }
    }

    draw() {
      p.push()
      p.translate(p.width / 2 - this.viewCenter[0], p.height / 2 - this.viewCenter[1])

      if (imageToggle.enabled) {
        let i = 0
        for (let row = 0; row < AXIS_SECTIONS - 1; row++) {
          for (let col = 0; col < AXIS_SECTIONS - 1; col++) {
            const posIndex = row * AXIS_SECTIONS + col
            const imageSection = imageSections[i++]
            p.image(
              imageSection,
              this.positions[posIndex][0],
              this.positions[posIndex][1],
              this.positions[posIndex + 1][0] - this.positions[posIndex][0] + 1,
              this.positions[posIndex + AXIS_SECTIONS][1] - this.positions[posIndex][1] + 1,
            )
          }
        }
      }

      for (let i = 0; i < SECTIONS; i++) {
        p.stroke(0)
        if (edgesToggle.enabled) {
          for (let j = i; j < SECTIONS; j++) {
            if (this.weights[i][j] > 0) {
              p.line(this.positions[i][0], this.positions[i][1], this.positions[j][0], this.positions[j][1])
            }
          }
        }

        if (verticesToggle.enabled) {
          p.fill(0)
          p.noStroke()
          p.ellipse(this.positions[i][0], this.positions[i][1], 10, 10)
        }
      }
      p.pop()
    }
  }

  class Button {
    constructor(x, y, w, h, label) {
      this.p = p
      this.neutralColor = 200
      this.hoverColor = 0
      this.pressedColor = '#1e90ff'
      this.pressed = false
      this.x = x
      this.y = y
      this.w = w
      this.h = h
      this.label = label
    }

    draw() {
      p.fill(this.getColor())
      p.rect(this.x, this.y, this.w, this.h)
      p.textSize(this.h)
      p.text(this.label, this.x + this.w + 5, this.y + this.h)
    }

    getColor() {
      return this.pressed ? this.pressedColor : this.hovering() ? this.hoverColor : this.neutralColor
    }

    hovering() {
      return p.mouseX >= this.x && p.mouseX <= this.x + this.w && p.mouseY >= this.y && p.mouseY <= this.y + this.h
    }

    mousePressed() {
      if (this.hovering()) this.pressed = true
    }

    mouseReleased() {
      this.pressed = false
    }
  }

  class Toggle extends Button {
    constructor(x, y, w, h, label) {
      super(x, y, w, h, label)
      this.enabled = false
    }

    setEnabled(enabled) {
      this.enabled = enabled
      return this
    }

    mouseReleased() {
      if (this.hovering()) this.enabled = !this.enabled
    }

    getColor() {
      return this.hovering() ? this.hoverColor : this.enabled ? this.pressedColor : this.neutralColor
    }
  }
}
