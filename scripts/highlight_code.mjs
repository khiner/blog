import { all, createLowlight } from 'lowlight'

const lowlight = createLowlight(all)

const tokenStyles = Object.fromEntries(
  [
    ['comment quote', { color: '#5c6370', fontStyle: 'italic' }],
    ['doctag keyword formula', { color: '#c678dd' }],
    ['section name selector-tag deletion subst', { color: '#e06c75' }],
    ['literal', { color: '#56b6c2' }],
    ['string regexp addition attribute meta-string', { color: '#98c379' }],
    ['built_in', { color: '#e6c07b' }],
    ['attr variable template-variable type selector-class selector-attr selector-pseudo number', { color: '#d19a66' }],
    ['symbol bullet meta selector-id title', { color: '#61aeee' }],
    ['link', { color: '#61aeee', textDecoration: 'underline' }],
    ['emphasis', { fontStyle: 'italic' }],
    ['strong', { fontWeight: 'bold' }],
  ].flatMap(([names, style]) => names.split(' ').map((name) => [`hljs-${name}`, style])),
)

const flattenTokens = (nodes, classes = []) =>
  nodes.flatMap((node) =>
    node.type === 'text'
      ? [[node.value, Object.assign({}, ...classes.map((name) => tokenStyles[name]))]]
      : flattenTokens(node.children, [...new Set([...classes, ...(node.properties.className ?? [])])]),
  )

const cssStyle = (style) =>
  Object.entries(style)
    .map(([name, value]) => `${name.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase())}:${value}`)
    .join(';')

export default function highlightCode() {
  return (tree) => {
    const visit = (node) => {
      const fenced = node.type === 'element' && node.tagName === 'pre' && node.children[0]?.tagName === 'code'
      const embedded = ['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) && node.name === 'CodeBlock'
      if (fenced || embedded) {
        const code = fenced ? node.children[0] : null
        const language = fenced
          ? (code.properties.className?.[0]?.replace(/^language-/, '') ?? 'shell')
          : (node.attributes.find((attribute) => attribute.name === 'language')?.value ?? 'shell')
        const text = fenced
          ? code.children[0].value.replace(/\n$/, '')
          : node.attributes.find((attribute) => attribute.name === 'code')?.value.data.estree.body[0].expression.value
        if (typeof text !== 'string') throw new Error('Code blocks require static text')
        const tokens =
          language === 'text'
            ? [{ type: 'text', value: text }]
            : (lowlight.listLanguages().includes(language)
                ? lowlight.highlight(language, text)
                : lowlight.highlightAuto(text)
              ).children
        Object.assign(node, {
          type: 'element',
          tagName: 'pre',
          properties: { style: 'color:#abb2bf;background:#282c34' },
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: [`language-${language}`], style: 'white-space:pre' },
              children: flattenTokens(tokens).map(([value, style]) => ({
                type: 'element',
                tagName: 'span',
                properties: { style: cssStyle(style) },
                children: [{ type: 'text', value }],
              })),
            },
          ],
        })
      } else node.children?.forEach(visit)
    }
    visit(tree)
  }
}
