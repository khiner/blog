import jsfeat from 'jsfeat'

import { windowResized } from './utils'
import image_asset from '../assets/cityscape.jpg'

export default function sketch(p) {
  const BACKGROUND_COLOR_STR = '#1e90ff'
  const FOREGROUND_COLOR_STR = 'rgb(221, 250, 252)'
  const DENSITY = p.pixelDensity()

  let cnv, image, edges, pixelMask
  let backgroundColor, foregroundColor, foregroundColorArray

  let snowRate = 6
  let imageSelectId = 0 // 0 == original image, 1 == snow, 2 == edge detect
  let isMouseDragging = false

  p.preload = () => {
    image = p.loadImage(image_asset)
  }

  function onSizeChange() {
    image.resize(p.int(p.width), p.int(p.height))
    image.loadPixels()

    let buffer = new jsfeat.matrix_t(p.int(p.width), p.int(p.height), jsfeat.U8C1_t)
    jsfeat.imgproc.grayscale(image.pixels, p.int(p.width), p.int(p.height), buffer)
    jsfeat.imgproc.gaussian_blur(buffer, buffer, 3, 0)
    jsfeat.imgproc.canny(buffer, buffer, 20, 50)
    edges = jsfeatToP5(buffer)
    pixelMask = new Array(p.int(p.width) * p.int(p.height)).fill(false)
  }

  p.setup = () => {
    backgroundColor = p.color(BACKGROUND_COLOR_STR)
    foregroundColor = p.color(FOREGROUND_COLOR_STR)
    foregroundColorArray = [p.red(foregroundColor), p.green(foregroundColor), p.blue(foregroundColor), 255]
    p.windowResized = windowResized(p, image.height / image.width, onSizeChange)
    cnv = p.createCanvas(600, 500)
    cnv.mouseClicked(() => {
      if (imageSelectId !== 1) imageSelectId = (imageSelectId + 1) % 3
    })

    cnv.mousePressed(() => {
      isMouseDragging = true
    })
    cnv.mouseReleased(() => {
      isMouseDragging = false
    })

    p.windowResized()
  }

  p.myCustomRedrawAccordingToNewPropsHandler = (_) => {}

  p.draw = () => {
    if (image && imageSelectId === 0) {
      p.image(image, 0, 0)
    } else if (imageSelectId === 1) {
      p.background(backgroundColor)
      snow()
      if (isMouseDragging) mouseSnow()
      if (!pixelMask) return

      shake()
      p.loadPixels()
      for (let x = 0; x < p.int(p.width); x++) {
        for (let y = 0; y < p.int(p.height); y++) {
          if (pixelMask[y * p.int(p.width) + x]) {
            for (let i = 0; i < DENSITY; i++) {
              for (let j = 0; j < DENSITY; j++) {
                const idx = 4 * ((y * DENSITY + j) * p.int(p.width) * DENSITY + (x * DENSITY + i))
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
    } else {
      p.image(edges, 0, 0)
    }
  }

  p.keyPressed = (event) => {
    event.stopPropagation()
    event.preventDefault()
  }
  p.keyReleased = (_) => {
    if (p.keyCode === p.UP_ARROW && snowRate < 40) ++snowRate
    else if (p.keyCode === p.DOWN_ARROW && snowRate > 0) --snowRate
    else if (p.key === ' ') imageSelectId = (imageSelectId + 1) % 3
  }

  // Drop snow from the top of the frame.
  function snow() {
    if (!pixelMask) return

    for (let i = 0; i < snowRate; i++) {
      pixelMask[p.int(p.random(0, p.width - 1))] = true
    }
  }

  // The mouse drops snow when held down.
  // Drop three 'snowflakes': one on the clicked pixel, one to the left, and one to the right.
  function mouseSnow() {
    console.log(`mouseX: ${p.mouseX}, mouseY: ${p.mouseY}`)
    const clickedPixel = p.int(p.mouseX) + p.int(p.mouseY) * p.int(p.width)
    if (clickedPixel < 0 || clickedPixel >= p.int(p.width) * p.int(p.height)) return

    for (let i = clickedPixel - 1; i <= clickedPixel + 1; i++) pixelMask[i] = true
  }

  // Move those white pixels!
  function shake() {
    if (!pixelMask) return

    for (let x = 0; x < p.int(p.width); x++) {
      for (let y = 0; y < p.int(p.height); y++) {
        const pixel = y * p.int(p.width) + x
        // Once an edge is colored white, it is locked, so ignore these pixels, and all empty ones
        if (!pixelMask[pixel] || edges.pixels[pixel * 4] === 255) continue

        const newX = p.int(p.constrain(x + p.int(p.random(-2, 2)), 0, p.width - 1))
        const newY = p.int(p.constrain(y + p.int(p.random(0, 2)), 0, p.height - 1))
        const newPixel = newY * p.int(p.width) + newX
        // if the new space is empty, move the white pixel to a new location
        if (!pixelMask[newPixel]) {
          pixelMask[newPixel] = true
          pixelMask[pixel] = false
        }
      }
    }
  }

  // https://github.com/marrific/Computer-Vision-with-JS/blob/feaaef0e47b7f18f4fc55bdab8a0ca5ff648bafd/shared/utils.js
  // Convert grayscale jsfeat image to p5 rgba image.
  function jsfeatToP5(src) {
    let dst = p.createImage(src.cols, src.rows)
    dst.loadPixels()
    const n = src.data.length
    const srcData = src.data
    let dstData = dst.pixels
    for (let i = 0, j = 0; i < n; i++) {
      dstData[j++] = dstData[j++] = dstData[j++] = srcData[i]
      dstData[j++] = 255
    }
    dst.updatePixels()
    return dst
  }
}
