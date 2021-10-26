import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export default ({ language = 'shell', children }) => (
  <SyntaxHighlighter language={language} style={atomOneDark}>
    {children}
  </SyntaxHighlighter>
)
