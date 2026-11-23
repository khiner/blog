import type { ComponentProps } from 'preact'
import { InternalLink } from './navigation'
import Image from './components/Image'
import Link from './components/Link'

const components = { a: Link, img: Image, Image, Link, InternalLink, ExternalLink: Link }

export const manualComponents = {
  ...components,
  table: (props: ComponentProps<'table'>) => (
    <div className="manual-table">
      <table {...props} />
    </div>
  ),
  a: (props: Parameters<typeof Link>[0]) => {
    const Anchor = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(props.href) ? Link : InternalLink
    return <Anchor {...props} />
  },
}

export default components
