import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

const CodeBlock = ({ language = 'shell', children }) => (
  <SyntaxHighlighter language={language} style={atomOneDark}>
    {children}
  </SyntaxHighlighter>
)

export default CodeBlock
export const Python = ({ children }) => CodeBlock({ language: 'python', children })
export const Cpp = ({ children }) => CodeBlock({ language: 'cpp', children })
