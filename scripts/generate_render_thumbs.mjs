// Generates grid thumbnails for MeshEditor renders (video items get a first-frame
// poster), plus dims.json recording each source's pixel dimensions for the manifest.
// Thumbs are staged outside the render tree as `<file>.thumb.jpg`, mirroring the source
// layout so they publish to the same URL prefix. Regeneration is mtime-based.
// Requires ffmpeg/ffprobe.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// JPEG rather than webp because ffmpeg builds universally include mjpeg, and the
// renders are opaque.
export const THUMB_SUFFIX = '.thumb.jpg'
const THUMB_WIDTH = 360 // ~2x the ~176px grid cell, for high-DPI displays.

const MEDIA_EXTENSIONS = new Set(['.webp', '.mp4'])

// Creates or refreshes one thumb. Returns true if it (re)generated.
export const ensureThumb = (sourcePath, thumbPath) => {
  if (existsSync(thumbPath) && statSync(thumbPath).mtimeMs >= statSync(sourcePath).mtimeMs) return false
  mkdirSync(path.dirname(thumbPath), { recursive: true })
  // -frames:v 1 takes the first frame of videos (and guards against animated webp).
  execFileSync('ffmpeg', [
    ...['-y', '-loglevel', 'error', '-i', sourcePath],
    ...['-frames:v', '1', '-vf', `scale=${THUMB_WIDTH}:-1`, '-q:v', '4', thumbPath],
  ])
  return true
}

const mediaDimensions = (sourcePath) => {
  const csv = execFileSync('ffprobe', [
    ...['-v', 'error', '-select_streams', 'v:0'],
    ...['-show_entries', 'stream=width,height', '-of', 'csv=p=0', sourcePath],
  ])
    .toString()
    .trim()
  const [width, height] = csv.split(',').map(Number)
  return width > 0 && height > 0 ? { width, height } : undefined
}

export const generateThumbs = (rootDir, stagingDir) => {
  const dimsPath = path.join(stagingDir, 'dims.json')
  const dims = existsSync(dimsPath) ? JSON.parse(readFileSync(dimsPath, 'utf8')) : {}
  let generated = 0
  const walk = (dir, relDir) => {
    for (const dirent of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, dirent.name)
      const relPath = relDir ? `${relDir}/${dirent.name}` : dirent.name
      if (dirent.isDirectory()) walk(fullPath, relPath)
      else if (MEDIA_EXTENSIONS.has(path.extname(dirent.name))) {
        if (ensureThumb(fullPath, path.join(stagingDir, relPath + THUMB_SUFFIX)) || !dims[relPath]) {
          dims[relPath] = mediaDimensions(fullPath)
          generated++
        }
      }
    }
  }
  walk(rootDir, '')
  mkdirSync(stagingDir, { recursive: true })
  writeFileSync(dimsPath, JSON.stringify(dims, null, 2))
  return generated
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [rootDir, stagingDir] = process.argv.slice(2)
  if (!rootDir || !stagingDir) {
    console.error('Usage: node generate_render_thumbs.mjs <render-dir> <staging-dir>')
    process.exit(1)
  }
  console.log(`Thumbnails up to date (${generateThumbs(rootDir, stagingDir)} regenerated)`)
}
