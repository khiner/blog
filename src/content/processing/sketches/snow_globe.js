import { cannyEdges } from './canny'
import { windowResized } from './utils'
import image_asset from '../assets/cityscape.jpg'

export default function sketch(p) {
  const backgroundColor = '#1e90ff'
  const snowColor = [221, 250, 252, 255]

  let cnv, sourceImage, image, edges, edgeMask, pixelMask

  let snowRate = 6
  let imageSelectId = 0 // 0 == original image, 1 == snow, 2 == edge detect
  let isMouseDragging = false

  const onSizeChange = () => {
    image = sourceImage.get()
    image.resize(p.width, p.height)
    image.loadPixels()

    edgeMask = cannyEdges(image.pixels, p.width, p.height)
    edges = p.createImage(p.width, p.height)
    edges.loadPixels()
    for (let i = 0; i < edgeMask.length; i++) {
      const offset = i * 4
      edges.pixels[offset] = edges.pixels[offset + 1] = edges.pixels[offset + 2] = edgeMask[i]
      edges.pixels[offset + 3] = 255
    }
    edges.updatePixels()
    pixelMask = new Uint8Array(p.width * p.height)
  }

  p.setup = async () => {
    sourceImage = await p.loadImage(image_asset)
    p.windowResized = windowResized(p, sourceImage.height / sourceImage.width, onSizeChange)
    cnv = p.createCanvas(600, 500)
    // Each snow cell occupies one canvas pixel.
    p.pixelDensity(1)
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
      for (let i = 0; i < pixelMask.length; i++) {
        if (pixelMask[i]) p.pixels.set(snowColor, i * 4)
      }
      p.updatePixels()
    } else {
      p.image(edges, 0, 0)
    }
  }

  p.keyPressed = (event) => {
    if ([p.UP_ARROW, p.DOWN_ARROW, ' '].includes(event.key)) {
      event.stopPropagation()
      event.preventDefault()
    }
  }
  p.keyReleased = (_) => {
    if (p.key === p.UP_ARROW && snowRate < 40) ++snowRate
    else if (p.key === p.DOWN_ARROW && snowRate > 0) --snowRate
    else if (p.key === ' ') imageSelectId = (imageSelectId + 1) % 3
  }

  // Drop snow from the top of the frame.
  const snow = () => {
    if (!pixelMask) return

    for (let i = 0; i < snowRate; i++) {
      pixelMask[p.int(p.random(0, p.width - 1))] = true
    }
  }

  // The mouse drops snow when held down.
  // Drop three 'snowflakes': one on the clicked pixel, one to the left, and one to the right.
  const mouseSnow = () => {
    const clickedPixel = p.int(p.mouseY) * p.width + p.int(p.mouseX)
    if (clickedPixel < 1 || clickedPixel >= p.width * p.height - 1) return

    for (let i = clickedPixel - 1; i <= clickedPixel + 1; i++) pixelMask[i] = true
  }

  // Move those white pixels!
  const shake = () => {
    if (!pixelMask) return

    for (let x = 0; x < p.width; x++) {
      for (let y = 0; y < p.height; y++) {
        const pixel = y * p.width + x
        // Once an edge is colored white, it is locked, so ignore these pixels, and all empty ones
        if (!pixelMask[pixel] || edgeMask[pixel] === 255) continue

        const newX = p.int(p.constrain(x + p.int(p.random(-2, 2)), 0, p.width - 1))
        const newY = p.int(p.constrain(y + p.int(p.random(0, 2)), 0, p.height - 1))
        const newPixel = newY * p.width + newX
        // if the new space is empty, move the white pixel to a new location
        if (!pixelMask[newPixel]) {
          pixelMask[newPixel] = true
          pixelMask[pixel] = false
        }
      }
    }
  }
}
