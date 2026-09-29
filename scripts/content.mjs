import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { compileSync } from '@mdx-js/mdx'
import { parse } from 'yaml'
import { parseSync } from 'vite'

const catalogId = '\0virtual:entries'
const summaryPrefix = '\0virtual:summary:'

export function readContent(source) {
  const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!header) throw new Error('MDX entries require YAML frontmatter')
  return { metadata: parse(header[1]), body: source.slice(header[0].length) }
}

// Markdown images and literal JSX media paths are imports so Vite hashes and emits assets.
export function contentAssets() {
  return (tree, file) => {
    const imports = []
    const relativeUrl = (url) => url && !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(url)
    const assetExpression = (url) => {
      const name = `_contentAsset${imports.length}`
      const source = `import ${name} from ${JSON.stringify(path.resolve(path.dirname(file.path), url))}`
      imports.push({ type: 'mdxjsEsm', value: source, data: { estree: parseSync('asset.js', source).program } })
      return {
        type: 'mdxJsxAttributeValueExpression',
        value: name,
        data: {
          estree: {
            type: 'Program',
            sourceType: 'module',
            body: [{ type: 'ExpressionStatement', expression: { type: 'Identifier', name } }],
          },
        },
      }
    }
    const visit = (node) => {
      if (node.type === 'image' && relativeUrl(node.url)) {
        Object.assign(node, {
          type: 'mdxJsxTextElement',
          name: 'Image',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'src', value: assetExpression(node.url) },
            { type: 'mdxJsxAttribute', name: 'alt', value: node.alt ?? '' },
            ...(node.title ? [{ type: 'mdxJsxAttribute', name: 'title', value: node.title }] : []),
          ],
          children: [],
        })
      }
      if (['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type)) {
        for (const attribute of node.attributes) {
          if (attribute.name === 'src' && typeof attribute.value === 'string' && relativeUrl(attribute.value)) {
            attribute.value = assetExpression(attribute.value)
          }
        }
      }
      node.children?.forEach(visit)
      if (node.children)
        node.children = node.children.flatMap((child) => {
          if (child.type === 'paragraph' && child.children.length === 1 && child.children[0].name === 'Image') {
            child.children[0].type = 'mdxJsxFlowElement'
            return child.children
          }
          return [child]
        })
    }
    visit(tree)
    tree.children.unshift(...imports)
  }
}

function inlineSummary() {
  return (tree) => {
    if (tree.children.length === 1 && tree.children[0].type === 'paragraph') tree.children = tree.children[0].children
  }
}

export default function content() {
  let contentDir
  let development
  const readEntry = (file) => {
    const entry = readContent(readFileSync(file, 'utf8'))
    const { path: route, title, date } = entry.metadata
    if (typeof route !== 'string' || !route.startsWith('/') || typeof title !== 'string') {
      throw new Error(`${file}: entries require a path starting with / and a title`)
    }
    if (date !== undefined && (typeof date !== 'string' || Number.isNaN(Date.parse(date)))) {
      throw new Error(`${file}: date must be a valid date string`)
    }
    if (entry.metadata.summary !== undefined && typeof entry.metadata.summary !== 'string') {
      throw new Error(`${file}: summary must be Markdown text`)
    }
    return entry
  }
  const reloadCatalog = (server) => {
    for (const module of server.moduleGraph.idToModuleMap.values()) {
      if (module.id === catalogId || module.id?.startsWith(summaryPrefix)) server.moduleGraph.invalidateModule(module)
    }
    server.ws.send({ type: 'full-reload' })
  }
  return {
    name: 'blog-content',
    enforce: 'pre',
    configResolved(config) {
      contentDir = path.join(config.root, 'src/content')
      development = config.command === 'serve'
    },
    resolveId(id) {
      if (id === 'virtual:entries') return catalogId
      if (id.startsWith('virtual:summary:')) return '\0' + id + '.js'
    },
    load(id) {
      if (id.startsWith(summaryPrefix)) {
        const file = id.slice(summaryPrefix.length, -3)
        if (!development) this.addWatchFile(file)
        const { metadata } = readEntry(file)
        return String(
          compileSync(
            { value: metadata.summary, path: file },
            {
              jsxImportSource: 'preact',
              development,
              remarkPlugins: [inlineSummary, contentAssets],
            },
          ),
        )
      }
      if (id !== catalogId) return
      const imports = []
      const entries = []
      const routes = new Set()
      for (const relative of readdirSync(contentDir, { recursive: true })
        .filter((file) => file.endsWith('.mdx'))
        .sort()) {
        const file = path.join(contentDir, relative)
        if (!development) this.addWatchFile(file)
        const { metadata } = readEntry(file)
        const { summary, draft, ...entry } = metadata
        if (draft) continue
        const route = entry.path.toLowerCase().replace(/\/+$/, '') || '/'
        if (routes.has(route)) throw new Error(`${file}: duplicate entry path ${entry.path}`)
        routes.add(route)
        const name = `Summary${imports.length}`
        if (summary) imports.push(`import ${name} from ${JSON.stringify('virtual:summary:' + file)}`)
        entries.push(
          `{...${JSON.stringify(entry)}, load: () => import(${JSON.stringify(file)})${summary ? `, Summary: ${name}` : ''}}`,
        )
      }
      return `${imports.join('\n')}\nexport default [${entries.join(',\n')}]`
    },
    transform(source, id) {
      if (!id.startsWith('\0') && id.endsWith('.mdx')) return { code: readContent(source).body, map: null }
    },
    configureServer(server) {
      server.watcher.add(contentDir)
      server.watcher.on('all', (event, file) => {
        if (['add', 'unlink'].includes(event) && file.startsWith(contentDir + path.sep) && file.endsWith('.mdx'))
          reloadCatalog(server)
      })
    },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.mdx')) {
        const module = server.moduleGraph.getModuleById(file)
        if (module) server.moduleGraph.invalidateModule(module)
        reloadCatalog(server)
        return []
      }
    },
  }
}
