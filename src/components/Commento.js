import React, { useEffect } from 'react'

const insertScript = (src, id, parentElement) => {
  const script = window.document.createElement('script')
  script.async = true
  script.src = src
  script.id = id
  parentElement.appendChild(script)
  return script
}

const removeScript = (id, parentElement) => {
  const script = window.document.getElementById(id)
  if (script) parentElement.removeChild(script)
}

export default function Commento({ id, commentoHostName }) {
  useEffect(() => {
    insertScript(
      `${commentoHostName}/js/commento.js`,
      'commento-script',
      window.document.body
    )
    return () => removeScript('commento-script', window.document.body)
  }, [id, commentoHostName])

  return <div id="commento" />
}
