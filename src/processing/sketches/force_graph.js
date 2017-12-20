import image_asset from '../assets/mario.jpg'

import { getBackgroundColor, copyArray } from './utils'

export default function sketch(p) {
  let setupFinished = false
  let parentColor = 100

  var halfWidth, halfHeight
  var image, imagePixels

  var network
  var imageToggle, edgesToggle, verticesToggle, pauseToggle
  var toggles

  p.windowResized = function() {
    const parentStyle = window.getComputedStyle(
      document.getElementById('force-graph-parent')
    )
    const setupWidth =
      parseFloat(parentStyle.width) -
      parseFloat(parentStyle.paddingLeft) -
      parseFloat(parentStyle.paddingRight)
    const setupHeight = setupWidth
    halfWidth = setupWidth / 2
    halfHeight = setupHeight / 2
    p.resizeCanvas(setupWidth, setupHeight)
  }

  p.preload = function() {
    image = p.loadImage(image_asset)
  }

  p.setup = function() {
    parentColor = p.color(getBackgroundColor('force-graph-parent'))
    network = new Network(5)

    const cnv = p.createCanvas(600, 400)
    p.noStroke()
    p.windowResized()

    const toggleDim = p.height / 40,
      toggleOffset = 5
    imageToggle = new Toggle(
      p.width - 200,
      0,
      toggleDim,
      toggleDim,
      'Image'
    ).setEnabled(true)
    edgesToggle = new Toggle(
      p.width - 200,
      toggleDim + toggleOffset,
      toggleDim,
      toggleDim,
      'Edges'
    ).setEnabled(true)
    verticesToggle = new Toggle(
      p.width - 200,
      (toggleDim + toggleOffset) * 2,
      toggleDim,
      toggleDim,
      'Vertices'
    ).setEnabled(true)
    pauseToggle = new Toggle(
      p.width - 400,
      0,
      toggleDim,
      toggleDim,
      'Pause'
    ).setEnabled(false)
    toggles = [imageToggle, edgesToggle, verticesToggle, pauseToggle]

    cnv.mousePressed(function() {
      toggles.forEach(toggle => {
        toggle.mousePressed()
      })
    })

    cnv.mouseReleased(function() {
      toggles.forEach(toggle => {
        toggle.mouseReleased()
      })
    })

    setupFinished = true
  }

  p.myCustomRedrawAccordingToNewPropsHandler = function(props) {}

  p.draw = function() {
    if (!setupFinished) {
      return
    }

    p.background(parentColor)
    if (!pauseToggle.enabled) {
      network.step()
    }
    network.draw()
    toggles.forEach(toggle => {
      toggle.draw()
    })

    if (imagePixels == null && image) {
      image.loadPixels()
      imagePixels = copyArray(image.pixels)
      network.onSizeChange()
    }
  }

  class Network {
    constructor(dim) {
      this.dimensions = 2
      this.k = 0.00006
      this.randomOffset = 0
      this.dim = dim
      this.numElements = dim * dim

      this.weights = []
      this.positions = []
      this.velocities = []

      for (let i = 0; i < this.numElements; i++) {
        this.positions[i] = []
        this.velocities[i] = []
        this.weights[i] = []

        for (let j = 0; j < this.numElements; j++) {
          this.weights[i][j] = 0
        }

        for (let j = 0; j < this.dimensions; j++) {
          this.positions[i][j] = 0
          this.velocities[i][j] = 0
        }
      }

      this.viewCenter = this.positions[parseInt(this.numElements / 2.0, 10)]

      for (let row = 0; row < this.dim; row++) {
        for (let col = 0; col < this.dim; col++) {
          if (row > 0) this.setWeight(row, col, row - 1, col, 1)
          if (row < this.dim - 1) this.setWeight(row, col, row + 1, col, 1)
          if (col > 0) this.setWeight(row, col, row, col - 1, 1)
          if (col < this.dim - 1) this.setWeight(row, col, row, col + 1, 1)
        }
      }
    }

    onSizeChange() {
      for (let i = 0; i < this.numElements; i++) {
        let row = parseInt(i / this.dim, 10)
        let col = i % this.dim
        this.positions[i][0] =
          p.width * (col / this.dim) +
          p.random(-this.randomOffset, this.randomOffset)
        this.positions[i][1] =
          p.height * (row / this.dim) +
          p.random(-this.randomOffset, this.randomOffset)
      }
    }

    setWeight(row, col, otherRow, otherCol, weight) {
      this.weights[row * this.dim + col][
        otherRow * this.dim + otherCol
      ] = weight
    }

    step() {
      for (let i = 0; i < this.numElements; i++) {
        for (let j = 0; j < this.numElements; j++) {
          if (this.weights[i][j] > 0) {
            for (let d = 0; d < this.dimensions; d++) {
              this.velocities[i][d] +=
                (this.positions[j][d] -
                  this.positions[i][d] -
                  this.weights[i][j]) *
                this.k
            }
          }
        }
      }

      for (let i = 0; i < this.numElements; i++) {
        for (let j = 0; j < this.numElements; j++) {
          for (let d = 0; d < this.dimensions; d++) {
            this.positions[i][d] += this.velocities[i][d]
          }
        }
      }
    }

    draw() {
      p.push()
      p.translate(
        halfWidth - this.viewCenter[0],
        halfHeight - this.viewCenter[1]
      )

      if (imageToggle.enabled) {
        let w = image.width / this.dim,
          h = image.height / this.dim
        if (imagePixels != null) {
          for (let col = 0; col < this.dim - 1; col++) {
            for (let row = 0; row < this.dim - 1; row++) {
              const imageSection = image.get(col * w, row * h, w, h)
              const i = row * this.dim + col
              p.image(
                imageSection,
                this.positions[i][0],
                this.positions[i][1],
                this.positions[i + 1][0] - this.positions[i][0] + 1,
                this.positions[i + this.dim][1] - this.positions[i][1] + 1
              )
            }
          }
        }
      }

      for (let i = 0; i < this.numElements; i++) {
        p.stroke(0)
        if (edgesToggle.enabled) {
          for (let j = i; j < this.numElements; j++) {
            if (this.weights[i][j] > 0) {
              p.line(
                this.positions[i][0],
                this.positions[i][1],
                this.positions[j][0],
                this.positions[j][1]
              )
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
      this.pressedColor = 'rgb(85, 170, 216)'
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
      return this.pressed
        ? this.pressedColor
        : this.hovering() ? this.hoverColor : this.neutralColor
    }

    hovering() {
      return (
        p.mouseX >= this.x &&
        p.mouseX <= this.x + this.w &&
        p.mouseY >= this.y &&
        p.mouseY <= this.y + this.h
      )
    }

    mousePressed() {
      if (this.hovering()) {
        this.pressed = true
      }
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
      if (this.hovering()) {
        this.enabled = !this.enabled
      }
    }

    getColor() {
      return this.hovering()
        ? this.hoverColor
        : this.enabled ? this.pressedColor : this.neutralColor
    }
  }
}
