import type { CSSProperties } from 'preact/compat'

type CodeBlockProps = {
  language?: string
  children?: string
  tokens?: [string, CSSProperties][]
}

const CodeBlock = ({ language = 'shell', tokens }: CodeBlockProps) => {
  if (!tokens) throw new Error('CodeBlock must be highlighted by the Vite code-block transform')

  return (
    <pre style={{ display: 'block', overflowX: 'auto', padding: '0.5em', color: '#abb2bf', background: '#282c34' }}>
      <code className={`language-${language}`} style={{ whiteSpace: 'pre' }}>
        {tokens.map(([text, style], index) => (
          <span key={index} style={style}>
            {text}
          </span>
        ))}
      </code>
    </pre>
  )
}

export default CodeBlock
export { CodeBlock as Python, CodeBlock as Cpp }
