import type { ComponentChildren } from 'preact'

interface EntryProps {
  title?: string
  subtitle?: string
  date?: string
  showcase?: boolean
  fullWidth?: boolean
  hideTitle?: boolean
  intro?: ComponentChildren
  children?: ComponentChildren
}

export default function Entry({ title, subtitle, date, showcase, fullWidth, hideTitle, intro, children }: EntryProps) {
  return (
    <div className={fullWidth ? 'page' : 'page article-page'}>
      {showcase ? (
        <div className="post-card showcase">
          <div className="post-card-header">
            <h1 className="title">{title}</h1>
            <h2 className="date">{date}</h2>
          </div>
          <div className="post-card-body">
            <div className="entry">{children}</div>
          </div>
        </div>
      ) : (
        <div className="entry">
          {title && !hideTitle && <h1 className="title">{title}</h1>}
          {subtitle && <h2 className="subtitle">{subtitle}</h2>}
          {date && <h3 className="date">{date}</h3>}
          {intro}
          {children}
        </div>
      )}
    </div>
  )
}
