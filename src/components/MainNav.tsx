import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import config from 'config'
import MailChimpEmailSignup from './MailChimpEmailSignup'

function HeaderDropdown({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLAnchorElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const focusOnOpen = useRef(false)

  const show = (keyboard = false) => {
    focusOnOpen.current = keyboard
    setMounted(true)
    setOpen(true)
  }
  const close = () => {
    if (menu.current?.contains(document.activeElement)) toggle.current?.focus()
    setOpen(false)
  }

  useLayoutEffect(() => {
    if (open && focusOnOpen.current) {
      menu.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus()
      focusOnOpen.current = false
    }
  }, [open])

  useEffect(() => {
    let tabbing = false
    let pointerStartedInMenu = false
    const onKeyDown = (event: KeyboardEvent) => {
      if (!root.current?.contains(event.target as Node)) return
      const input = event.target as HTMLInputElement
      const fromMenu = menu.current?.contains(input)
      if (
        /input|textarea/i.test(input.tagName) &&
        (event.key === ' ' ||
          (event.key !== 'Escape' && fromMenu) ||
          (event.key === 'Escape' && input.type === 'search'))
      )
        return
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (!open) show(true)
        else menu.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        close()
      } else if (event.key === 'Tab' && open) {
        tabbing = true
      }
    }
    const onKeyUp = () => {
      if (tabbing && !menu.current?.contains(document.activeElement)) close()
      tabbing = false
    }
    const onMouseDown = (event: MouseEvent) => {
      pointerStartedInMenu = !!menu.current?.contains(event.target as Node)
    }
    const onClick = (event: MouseEvent) => {
      if (
        !pointerStartedInMenu &&
        event.button === 0 &&
        !event.metaKey &&
        !event.altKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !root.current?.contains(event.target as Node)
      )
        close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    if (open) {
      document.addEventListener('mousedown', onMouseDown, true)
      document.addEventListener('click', onClick)
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('mousedown', onMouseDown, true)
      document.removeEventListener('click', onClick)
    }
  }, [open])

  return (
    <div className="header-dropdown" ref={root}>
      <a
        id={id}
        href="#"
        role="button"
        tabIndex={0}
        className="header-dropdown-toggle header-link"
        aria-expanded={open}
        ref={toggle}
        onClick={(event) => {
          event.preventDefault()
          if (open) close()
          else show()
        }}
        onKeyDown={(event) => {
          if (event.key === ' ') {
            event.preventDefault()
            event.currentTarget.click()
          }
        }}
      >
        {title}
      </a>
      {mounted && (
        <div
          className={`header-dropdown-menu${open ? ' open' : ''}`}
          aria-labelledby={id}
          ref={menu}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a[href]')) close()
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default function MainNav() {
  const [linksOpen, setLinksOpen] = useState(false)
  const [phase, setPhase] = useState('closed')
  const collapse = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)

  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const element = collapse.current!
    element.style.height = linksOpen ? '0px' : `${element.offsetHeight}px`
    setPhase('transitioning')
    // Start from the current height before setting the transition's destination.
    void element.offsetHeight
    const frame = requestAnimationFrame(() => {
      element.style.height = linksOpen ? `${element.scrollHeight}px` : '0px'
    })
    const finish = () => {
      cancelAnimationFrame(frame)
      element.style.height = ''
      setPhase(linksOpen ? 'open' : 'closed')
    }
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target === element) finish()
    }
    element.addEventListener('transitionend', onTransitionEnd)
    const timeout = window.setTimeout(finish, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 5 : 300)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      element.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [linksOpen])

  return (
    <nav className="site-header">
      <span className="site-brand">
        <Link to="/">{config.hostname}</Link>
      </span>
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
      <div id="header-links" className={`header-collapse ${phase}`} ref={collapse}>
        <div className="header-links">
          {config.topLevelLinks?.map((topLevelLink) => (
            <a key={topLevelLink.label} className="header-link" href={topLevelLink.href} target="_blank">
              {topLevelLink.label}
            </a>
          ))}
          {config.mailChimpFormAction && config.mailChimpInputName && (
            <HeaderDropdown title="Subscribe" id="subscribe">
              <MailChimpEmailSignup formAction={config.mailChimpFormAction} inputName={config.mailChimpInputName} />
            </HeaderDropdown>
          )}
          {config.email && (
            <HeaderDropdown title="Contact" id="contact">
              <a className="header-link" href={`mailto:${config.email}?Subject=Hello!`} target="_blank">
                {config.email}
              </a>
            </HeaderDropdown>
          )}
        </div>
      </div>
    </nav>
  )
}
