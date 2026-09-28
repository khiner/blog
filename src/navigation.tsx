import { useSyncExternalStore } from 'preact/compat'
import type { AnchorHTMLAttributes } from 'preact/compat'

const navigationEvent = 'blog:navigate'

export function normalizePath(pathname: string) {
  try {
    pathname = decodeURI(pathname)
  } catch {
    // Malformed escapes remain unmatched paths.
  }
  return (pathname.replace(/\/+$/, '') || '/').toLowerCase()
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  window.addEventListener(navigationEvent, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(navigationEvent, onChange)
  }
}

export const usePathname = () => normalizePath(useSyncExternalStore(subscribe, () => window.location.pathname))

export function navigate(href: string, replace = false) {
  const next = new URL(href, window.location.href)
  const changedPage = normalizePath(next.pathname) !== normalizePath(window.location.pathname)
  if (replace) window.history.replaceState(null, '', href)
  else window.history.pushState(null, '', href)
  if (changedPage && !next.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  window.dispatchEvent(new Event(navigationEvent))
}

export function InternalLink({ href, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event)
        const anchor = event.currentTarget
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          (anchor.target && anchor.target !== '_self') ||
          anchor.hasAttribute('download') ||
          !href
        )
          return
        const url = new URL(anchor.href)
        if (url.origin !== window.location.origin) return
        // Let the browser scroll to anchors within the current page.
        if (url.hash && url.pathname === window.location.pathname && url.search === window.location.search) return
        event.preventDefault()
        navigate(url.pathname + url.search + url.hash)
      }}
    />
  )
}
