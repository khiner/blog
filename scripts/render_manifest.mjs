// Builds the /MeshEditor/render gallery manifest from a MeshEditor render tree, where
// each leaf dir holds media named `<Scene>[.<MaterialVariant>].(webp|mp4)`, optionally
// nested one level deeper for format variants (e.g. Lantern/glTF-Draco/Lantern.webp).
// Emits { rows: [{ dir, items: [{ name, src, width?, height? }] }] }, with dimensions
// from an optional dims.json (see generate_render_thumbs.mjs).

import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const MEDIA_EXTENSIONS = new Set(['.webp', '.mp4'])

export const generateManifest = (rootDir, dims = {}) => {
  const itemsByRowDir = new Map()

  const addMediaFile = (relPath) => {
    const segments = relPath.split('/')
    const fileName = segments.pop()
    const stem = fileName.slice(0, fileName.lastIndexOf('.'))
    const [scene, ...materialParts] = stem.split('.')
    const material = materialParts.join('.')

    const leafDir = segments[segments.length - 1]
    const isFormatVariant = segments.length >= 2 && leafDir !== scene && segments[segments.length - 2] === scene
    const rowDir = segments.slice(0, isFormatVariant ? -2 : -1).join('/')
    const nameParts = isFormatVariant ? [scene, leafDir] : [scene]
    if (material) nameParts.push(material)

    if (!itemsByRowDir.has(rowDir)) itemsByRowDir.set(rowDir, [])
    itemsByRowDir.get(rowDir).push({ name: nameParts.join(' · '), src: relPath, ...dims[relPath] })
  }

  const walk = (dir, relDir) => {
    for (const dirent of readdirSync(dir, { withFileTypes: true })) {
      const relPath = relDir ? `${relDir}/${dirent.name}` : dirent.name
      if (dirent.isDirectory()) walk(path.join(dir, dirent.name), relPath)
      else if (MEDIA_EXTENSIONS.has(path.extname(dirent.name))) addMediaFile(relPath)
    }
  }
  walk(rootDir, '')

  const rows = [...itemsByRowDir.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dir, items]) => ({ dir, items: items.sort((a, b) => a.name.localeCompare(b.name)) }))
  return { rows }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [rootDir, dimsPath] = process.argv.slice(2)
  if (!rootDir) {
    console.error('Usage: node render_manifest.mjs <render-dir> [dims.json]')
    process.exit(1)
  }
  const dims = dimsPath ? JSON.parse(readFileSync(dimsPath, 'utf8')) : {}
  console.log(JSON.stringify(generateManifest(rootDir, dims), null, 2))
}
