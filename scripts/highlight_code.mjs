import { parseSync, Visitor } from 'vite'
import lowlight from 'lowlight'
import MagicString from 'magic-string'

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

const propertyName = (property) => property.key?.name ?? property.key?.value
const languages = { default: null, CodeBlock: null, Python: 'python', Cpp: 'cpp' }

export default function highlightCode() {
  return {
    name: 'highlight-static-code',
    // Let Vite normalize JSX text and entities before extracting static strings.
    enforce: 'post',
    transform(source, id) {
      if (!id.endsWith('.tsx') || !source.includes('CodeBlock')) return
      const { program, errors } = parseSync(id, source)
      if (errors.length) this.error(errors[0].message)
      const bindings = new Map()
      const jsx = new Set()
      for (const statement of program.body) {
        if (statement.type !== 'ImportDeclaration') continue
        for (const specifier of statement.specifiers) {
          const name = specifier.type === 'ImportDefaultSpecifier' ? 'default' : specifier.imported?.name
          if (/(^|\/)CodeBlock(?:\.tsx)?$/.test(statement.source.value)) {
            if (Object.hasOwn(languages, name)) bindings.set(specifier.local.name, languages[name])
          } else if (
            /^react\/jsx-(dev-)?runtime$/.test(statement.source.value) &&
            ['jsx', 'jsxs', 'jsxDEV'].includes(name)
          ) {
            jsx.add(specifier.local.name)
          }
        }
      }
      if (!bindings.size) return
      const transformed = new MagicString(source)
      const fail = (message, node) => this.error(message, node.start)
      new Visitor({
        CallExpression(node) {
          if (!jsx.has(node.callee.name) || !bindings.has(node.arguments[0]?.name)) return
          const props = node.arguments[1]
          if (
            props?.type !== 'ObjectExpression' ||
            props.properties.some((p) => p.type !== 'Property' || !['children', 'language'].includes(propertyName(p)))
          )
            fail('Code blocks accept only a static language and string', node)
          const languageProp = props.properties.find((p) => propertyName(p) === 'language')
          if (languageProp && typeof languageProp.value.value !== 'string')
            fail('Code blocks require a static language', languageProp)
          const value = props.properties.find((p) => propertyName(p) === 'children')?.value
          const text =
            value?.type === 'TemplateLiteral' && !value.expressions.length ? value.quasis[0].value.cooked : value?.value
          if (typeof text !== 'string') fail('Code blocks require a static string', node)
          const language = bindings.get(node.arguments[0].name) ?? languageProp?.value.value ?? 'shell'
          const tree =
            language === 'text'
              ? [{ type: 'text', value: text }]
              : (lowlight.listLanguages().includes(language)
                  ? lowlight.highlight(language, text)
                  : lowlight.highlightAuto(text)
                ).value
          transformed.overwrite(props.start, props.end, JSON.stringify({ language, tokens: flattenTokens(tree) }))
        },
      }).visit(program)
      if (!transformed.hasChanged()) return
      return {
        code: transformed.toString(),
        map: transformed.generateMap({ hires: true, source: id, includeContent: true }),
      }
    },
  }
}
