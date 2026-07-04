import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

import { createReadStream, existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateManifest } from './scripts/render_manifest.mjs'
import { THUMB_SUFFIX, ensureThumb } from './scripts/generate_render_thumbs.mjs'

// In production, /MeshEditor/render-data/ is real files on the server, published by
// scripts/deploy_render_data.sh (and eventually by MeshEditor CI). In dev, serve the
// same URLs straight from the sibling MeshEditor repo's render output tree, generating
// thumbnails on demand into the same cache the deploy script uses.
const renderDataDevServer = () => {
  const root = path.dirname(fileURLToPath(import.meta.url))
  const sourceDir = path.resolve(root, '../MeshEditor/render')
  const thumbCacheDir = path.resolve(root, 'node_modules/.cache/render-thumbs')
  const contentTypes = { '.webp': 'image/webp', '.mp4': 'video/mp4' }

  const serve = (req, res, filePath, contentType) => {
    const { size } = statSync(filePath)
    const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/)
    if (range) {
      const start = range[1] ? Number(range[1]) : 0
      const end = range[2] ? Number(range[2]) : size - 1
      res.writeHead(206, {
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': end - start + 1,
        'Accept-Ranges': 'bytes',
      })
      createReadStream(filePath, { start, end }).pipe(res)
    } else {
      res.writeHead(200, { 'Content-Type': contentType, 'Content-Length': size, 'Accept-Ranges': 'bytes' })
      createReadStream(filePath).pipe(res)
    }
  }

  return {
    name: 'mesh-editor-render-data',
    configureServer(server) {
      server.middlewares.use('/MeshEditor/render-data', (req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? '').split('?')[0])
        if (urlPath === '/manifest.json') {
          if (!existsSync(sourceDir)) {
            res.statusCode = 404
            res.end(`Render source dir not found: ${sourceDir}`)
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(generateManifest(sourceDir)))
          return
        }

        if (urlPath.endsWith(THUMB_SUFFIX)) {
          const sourcePath = path.join(sourceDir, urlPath.slice(0, -THUMB_SUFFIX.length))
          if (!sourcePath.startsWith(sourceDir + path.sep) || !existsSync(sourcePath)) return next()
          const thumbPath = path.join(thumbCacheDir, urlPath)
          ensureThumb(sourcePath, thumbPath)
          return serve(req, res, thumbPath, 'image/jpeg')
        }

        const filePath = path.join(sourceDir, urlPath)
        const contentType = contentTypes[path.extname(filePath)]
        if (!contentType || !filePath.startsWith(sourceDir + path.sep) || !existsSync(filePath)) return next()
        serve(req, res, filePath, contentType)
      })
    },
  }
}

export default defineConfig(() => ({
  build: {
    outDir: 'build',
  },
  plugins: [react(), tsconfigPaths(), renderDataDevServer()],
  base: '/',
}))
