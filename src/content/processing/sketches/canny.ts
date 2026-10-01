// RGBA to a binary edge mask: grayscale, 3x3 Gaussian blur, Sobel gradients,
// non-maximum suppression, then eight-connected hysteresis.
export function cannyEdges(rgba: Uint8ClampedArray, width: number, height: number, low = 20, high = 50): Uint8Array {
  const size = width * height
  const edges = new Uint8Array(size)
  if (width < 3 || height < 3) return edges

  const gray = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    const offset = i * 4
    gray[i] = Math.round(0.299 * rgba[offset] + 0.587 * rgba[offset + 1] + 0.114 * rgba[offset + 2])
  }

  // Separable [1, 2, 1] kernel, with replicated borders and a single rounding step.
  const horizontal = new Uint16Array(size)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      horizontal[i] = gray[i - (x > 0 ? 1 : 0)] + 2 * gray[i] + gray[i + (x < width - 1 ? 1 : 0)]
    }
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      gray[i] = (horizontal[i - (y > 0 ? width : 0)] + 2 * horizontal[i] + horizontal[i + (y < height - 1 ? width : 0)] + 8) >> 4
    }
  }

  const magnitude = new Uint16Array(size)
  const direction = new Uint8Array(size)
  const offsets = [1, width, width + 1, width - 1]
  const tan22 = Math.SQRT2 - 1
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const diagonalX = gray[i + width + 1] - gray[i - width - 1]
      const diagonalY = gray[i + width - 1] - gray[i - width + 1]
      const dx = diagonalX - diagonalY + 2 * (gray[i + 1] - gray[i - 1])
      const dy = diagonalX + diagonalY + 2 * (gray[i + width] - gray[i - width])
      const gx = Math.abs(dx),
        gy = Math.abs(dy)
      // L1 magnitude keeps thresholds in the same units as the sketch's original detector.
      magnitude[i] = gx + gy
      direction[i] = gy < gx * tan22 ? 0 : gx < gy * tan22 ? 1 : dx * dy >= 0 ? 2 : 3
    }
  }

  const stack = new Int32Array(size)
  let pending = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      const strength = magnitude[i]
      if (strength <= low) continue

      const offset = offsets[direction[i]]
      // Break ties consistently so flat gradient peaks produce a single-pixel edge.
      if (strength <= magnitude[i - offset] || strength < magnitude[i + offset]) continue
      if (strength > high) {
        edges[i] = 255
        stack[pending++] = i
      } else {
        edges[i] = 1
      }
    }
  }

  while (pending > 0) {
    const i = stack[--pending]
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        const neighbor = i + y * width + x
        if (edges[neighbor] === 1) {
          edges[neighbor] = 255
          stack[pending++] = neighbor
        }
      }
    }
  }
  for (let i = 0; i < size; i++) {
    if (edges[i] !== 255) edges[i] = 0
  }
  return edges
}
