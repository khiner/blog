import { useEffect, useRef, useState } from 'preact/hooks'
import { InternalLink } from 'navigation'
import config from 'config'
import MailChimpEmailSignup from './MailChimpEmailSignup'

function SubscribeDropdown() {
  const root = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!root.current.contains(event.target as Node)) root.current.open = false
    }
    document.addEventListener('click', closeOutside)
    return () => document.removeEventListener('click', closeOutside)
  }, [])

  return (
    <details
      className="header-dropdown"
      ref={root}
      onKeyDown={(event) => {
        const details = event.currentTarget
        const summary = details.querySelector('summary')!
        if (event.key === 'Tab') {
          // Check focus after the browser has moved it, without moving click targets during pointerdown.
          setTimeout(() => {
            if (!details.contains(document.activeElement)) details.open = false
          }, 0)
        } else if (event.key === 'Escape') {
          event.preventDefault()
          details.open = false
          summary.focus()
        } else if (event.target === summary && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
          event.preventDefault()
          details.open = true
          details.querySelector('input')?.focus()
        }
      }}
    >
      <summary id="subscribe" className="header-link">
        Subscribe
      </summary>
      <div className="header-dropdown-menu" aria-labelledby="subscribe">
        <MailChimpEmailSignup />
      </div>
    </details>
  )
}

export default function MainNav() {
  const [linksOpen, setLinksOpen] = useState(false)

  return (
    <nav className="site-header" aria-label="Site links">
      <InternalLink className="site-brand" href="/">
        {config.hostname}
      </InternalLink>
      <button
        type="button"
        className="header-menu-toggle"
        aria-label="Links"
        aria-controls="header-links"
        aria-expanded={linksOpen}
        onClick={() => setLinksOpen(!linksOpen)}
      >
        Links
        <svg className="header-menu-chevron" viewBox="0 0 12 8" aria-hidden="true">
          <path d="m1 2 5 4 5-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div id="header-links" className={`header-links${linksOpen ? ' open' : ''}`}>
        {config.topLevelLinks.map(({ label, href }) => (
          <a key={label} className="header-link" href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        ))}
        <SubscribeDropdown />
        <a className="header-link" href={`mailto:${config.email}?Subject=Hello!`}>
          Contact
        </a>
      </div>
    </nav>
  )
}
