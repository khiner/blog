import jsfeat from 'jsfeat'

import { windowResized } from './utils'
import image_asset from '../assets/cityscape.jpg'

export default function sketch(p) {
  const BACKGROUND_COLOR_STR = 'rgb(85, 170, 216)'
  const FOREGROUND_COLOR_STR = 'rgb(221, 250, 252)'
  const DENSITY = p.pixelDensity()

  var cnv, image, edges, pixelMask
  var backgroundColor, foregroundColor, foregroundColorArray

  let snowRate = 6
  let imageSelectId = 0 // 0 == original image, 1 == snow, 2 == edge detect
  let isMouseDragging = false

  p.preload = function () {
    image = p.loadImage(image_asset)
  }

  function onSizeChange() {
    image.resize(p.width, p.height)
    image.loadPixels()
    const buffer = new jsfeat.matrix_t(p.width, p.height, jsfeat.U8C1_t)

    var blurSize = 3
    var lowThreshold = 20
    var highThreshold = 50
    jsfeat.imgproc.grayscale(image.pixels, p.width, p.height, buffer)
    jsfeat.imgproc.gaussian_blur(buffer, buffer, blurSize, 0)
    jsfeat.imgproc.canny(buffer, buffer, lowThreshold, highThreshold)
    edges = jsfeatToP5(buffer)
    pixelMask = []
    for (let i = 0; i < p.width * p.height; i++) {
      pixelMask.push(false)
    }
  }

  p.setup = function () {
    backgroundColor = p.color(BACKGROUND_COLOR_STR)
    foregroundColor = p.color(FOREGROUND_COLOR_STR)
    foregroundColorArray = [p.red(foregroundColor), p.green(foregroundColor), p.blue(foregroundColor), 255]
    p.windowResized = windowResized(p, image.height / image.width, onSizeChange)
    cnv = p.createCanvas(600, 400)
    cnv.mouseClicked(function () {
      if (imageSelectId !== 1) {
        imageSelectId = (imageSelectId + 1) % 3
      }
    })

    cnv.mousePressed(function () {
      isMouseDragging = true
    })

    cnv.mouseReleased(function () {
      isMouseDragging = false
    })

    p.windowResized()
  }

  p.myCustomRedrawAccordingToNewPropsHandler = function (props) {}

  p.draw = function () {
    if (image && imageSelectId === 0) {
      p.image(image, 0, 0)
    } else if (imageSelectId === 1) {
      p.background(backgroundColor)
      snow()
      if (isMouseDragging) {
        mouseSnow()
      }
      if (pixelMask) {
        shake()
        p.loadPixels()
        var idx
        for (let x = 0; x < p.width; x++) {
          for (let y = 0; y < p.height; y++) {
            if (pixelMask[y * p.width + x]) {
              for (let i = 0; i < DENSITY; i++) {
                for (let j = 0; j < DENSITY; j++) {
                  idx = 4 * ((y * DENSITY + j) * p.width * DENSITY + (x * DENSITY + i))
                  p.pixels[idx] = foregroundColorArray[0]
                  p.pixels[idx + 1] = foregroundColorArray[1]
                  p.pixels[idx + 2] = foregroundColorArray[2]
                  p.pixels[idx + 3] = foregroundColorArray[3]
                }
              }
            }
          }
        }
        p.updatePixels()
      }
    } else {
      p.image(edges, 0, 0)
    }
  }

  p.keyPressed = function (event) {
    event.stopPropagation()
    event.preventDefault()
  }
  p.keyReleased = function (event) {
    if (p.keyCode === p.UP_ARROW && snowRate < 40) snowRate++
    else if (p.keyCode === p.DOWN_ARROW && snowRate > 0) snowRate--
    else if (p.key === ' ') imageSelectId = (imageSelectId + 1) % 3
  }

  // Drop snow from the top of the frame
  function snow() {
    if (pixelMask) {
      for (let i = 0; i < snowRate; i++) {
        const index = parseInt(p.random(0, p.width), 10)
        pixelMask[index] = true
      }
    }
  }

  // The mouse drops snow when held down.
  // Drop three 'snowflakes': one on the clicked pixel, one to the left, and one to the right
  function mouseSnow() {
    if (p.mouseX > 0 && p.mouseX < p.width - 1 && p.mouseY > 0 && p.mouseY < p.height - 1) {
      let clickedPix = p.mouseX + p.mouseY * p.width
      for (let i = clickedPix - 1; i <= clickedPix + 1; i++) {
        pixelMask[i] = true
      }
    }
  }

  // Move those white pixels!
  function shake() {
    if (!pixelMask) {
      return
    }

    for (let x = 0; x < p.width; x++) {
      for (let y = 0; y < p.height; y++) {
        let pixel = y * p.width + x
        // once an edge is colored white, it is locked, so ignore these pixels, and all empty ones
        if (!pixelMask[pixel] || edges.pixels[pixel * 4] === 255) {
          continue
        }

        let newY = y + parseInt(p.random(0, 2), 10)
        let newX = x + parseInt(p.random(-2, 2), 10)
        if (newY < 0) newY = 0
        else if (newY >= p.height) newY = p.height - 1

        if (newX < 0) newX = 0
        else if (newX >= p.width) newX = p.width - 1

        let newPixel = newY * p.width + newX
        // if the new space is empty, move the white pixel to a new location
        if (!pixelMask[newPixel]) {
          pixelMask[newPixel] = true
          pixelMask[pixel] = false
        }
      }
    }
  }

  // https://github.com/marrific/Computer-Vision-with-JS/blob/feaaef0e47b7f18f4fc55bdab8a0ca5ff648bafd/shared/utils.js
  // convert grayscale jsfeat image to p5 rgba image
  // usage: dst = jsfeatToP5(src, dst)
  function jsfeatToP5(src) {
    var dst = p.createImage(src.cols, src.rows)
    dst.loadPixels()
    var n = src.data.length
    var srcData = src.data
    var dstData = dst.pixels
    for (var i = 0, j = 0; i < n; i++) {
      var cur = srcData[i]
      dstData[j++] = cur
      dstData[j++] = cur
      dstData[j++] = cur
      dstData[j++] = 255
    }
    dst.updatePixels()
    return dst
  }
}
