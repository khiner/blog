import { createProcessor } from '@mdx-js/mdx'
import MiniSearch from 'minisearch'
import remarkGfm from 'remark-gfm'
import signatures from '../src/content/mesh_editor/manual/modeling/materialx/signatures.mjs'

export const manualDirectory = 'mesh_editor/manual'
export const manualRemarkPlugins = [remarkGfm, manualHeadings]
const parser = createProcessor({ remarkPlugins: manualRemarkPlugins })

function text(node) {
  if (['text', 'inlineCode', 'code'].includes(node.type)) return node.value
  if (node.type === 'image') return node.alt ?? ''
  return node.children?.map(text).join(' ') ?? ''
}

const attribute = (node, name) => node?.attributes?.find((attr) => attr.name === name)?.value

// Rendered headings, section links and search destinations share these IDs.
function sections(tree) {
  const parts = [{ nodes: [] }]
  for (const node of tree.children) {
    const heading = node.type === 'paragraph' && node.children.length === 1 ? node.children[0] : node
    const explicitId = /^h[23]$/.test(heading.name) && attribute(heading, 'id')
    if (explicitId || (heading.type === 'heading' && [2, 3].includes(heading.depth))) {
      parts.push({ node, heading, title: text(heading).trim(), identifier: explicitId || '', nodes: [] })
    } else {
      parts.at(-1).nodes.push(node)
    }
  }
  const used = new Set()
  for (const part of parts.slice(1)) {
    const { heading, nodes, title } = part
    if (heading.depth === 3)
      part.identifier =
        attribute(
          nodes.find((node) => node.name === 'OperationPorts'),
          'identifier',
        ) ?? ''
    const base =
      part.identifier ||
      title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/^-|-$/g, '')
    part.id = base
    for (let n = 2; !part.identifier && used.has(part.id); n++) part.id = base + '-' + n
    used.add(part.id)
    if (heading.type === 'heading') heading.data = { ...heading.data, hProperties: { ...heading.data?.hProperties, id: part.id } }
  }
  return parts
}

function manualHeadings() {
  return (tree, file) => {
    if (!file.path?.includes('/' + manualDirectory + '/')) return
    const children = []
    let links
    for (const { node, nodes, title, identifier } of sections(tree)) {
      if (identifier) {
        if (!links) {
          links = []
          children.push({ type: 'paragraph', children: links })
        }
        if (links.length) links.push({ type: 'text', value: ' · ' })
        links.push({ type: 'link', url: '#' + identifier, children: [{ type: 'text', value: title }] })
      } else {
        links = undefined
      }
      if (node) children.push(node)
      children.push(...nodes)
    }
    tree.children = children
  }
}

// OperationPorts stores its visible descriptions and type tables in literal JSX props.
function literalValue(expression) {
  if (expression.type === 'ArrayExpression') return expression.elements.map(literalValue)
  if (expression.type === 'ObjectExpression')
    return Object.fromEntries(expression.properties.map(({ key, value }) => [key.value ?? key.name, literalValue(value)]))
  return expression.value ?? ''
}

function portText(value) {
  if (Array.isArray(value)) return value.map(portText).join(' ')
  if (typeof value !== 'object') return value
  return Object.entries(value)
    .map(([name, item]) => (name === 'sameAs' ? '' : name + ' — ') + portText(item))
    .join('\n')
}

function searchText(node) {
  if (node.name === 'OperationPorts') {
    const props = node.attributes.flatMap(({ name, value }) => {
      if (name === 'signature') return Object.values(signatures[value]).map(portText)
      return typeof value === 'string' ? value : portText(literalValue(value.data.estree.body[0].expression))
    })
    return [...props, text(node)].join('\n')
  }
  // Chapter listings link to pages that have their own search entries.
  if (node.type === 'list' && node.children.every((item) => item.children[0]?.children?.[0]?.type === 'link')) return ''
  return text(node)
}

export function buildManualSearch(entries) {
  const options = { idField: 'href', fields: ['title', 'alias', 'body'], storeFields: ['title', 'alias', 'page', 'body'] }
  const index = new MiniSearch(options)
  for (const { metadata, body } of entries) {
    for (const { id, title, identifier, nodes } of sections(parser.parse(body))) {
      const content = nodes
        .map(searchText)
        .join('\n')
        .replace(/ {2,}/g, ' ')
        .replace(/ +([.,;:!?])/g, '$1')
        .trim()
      if (id && !content) continue
      index.add({
        href: metadata.path + (id ? '#' + id : ''),
        title: title ?? metadata.title,
        page: id ? metadata.title : '',
        alias: id ? identifier : (metadata.navTitle ?? ''),
        body: content,
      })
    }
  }
  return `import MiniSearch from 'minisearch'
import remarkGfm from 'remark-gfm'; export default MiniSearch.loadJS(${JSON.stringify(index)}, ${JSON.stringify(options)})`
}
