import React, { useEffect } from 'react'
import type { ReactNode } from 'react'

import config from 'config'

interface EntryProps {
  title?: string
  subtitle?: string
  date?: string
  type?: string
  fullWidth?: boolean
  hideTitle?: boolean
  intro?: ReactNode
  children?: ReactNode
}

const formatMathWhenContentIsReady = () => {
  const element = document.getElementById('loadedContent')
  if (element === null) {
    window.requestAnimationFrame(formatMathWhenContentIsReady)
  } else {
    window.MathJax?.typesetPromise?.([element]).catch((err) => {
      console.error('Error typesetting math:', err)
    })
  }
}

const Header = ({ title, date }) => (
  <div>
    <h1 className="title">{title}</h1>
    <h2 className="date">{date}</h2>
  </div>
)

export default React.memo(
  function Entry({ title, subtitle, date, type, fullWidth, hideTitle, intro, children }: EntryProps) {
    useEffect(() => {
      formatMathWhenContentIsReady()
    }, [])

    const isShowcase = type && type.toLowerCase() === 'showcase'
    const columnBreak = <div className="article-spacer" />
    const formattedTitle = config.siteName && title ? `${config.siteName} - ${title}` : config.siteName || title

    return (
      <div>
        <title>{formattedTitle}</title>
        {columnBreak}
        <div className={fullWidth ? 'page-fluid' : 'page-width article-page'}>
          {!isShowcase && (
            <div className="entry">
              {title && !hideTitle && <h1 className="title">{title}</h1>}
              {subtitle && <h2 className="subtitle">{subtitle}</h2>}
              {date && <h3 className="date">{date}</h3>}
              {intro}
              {children}
            </div>
          )}
          {isShowcase && (
            <div className="post-card">
              <div className="post-card-header">
                <Header title={title} date={date} />
              </div>
              <div className="post-card-body">
                <div className="entry Showcase">{children}</div>
              </div>
            </div>
          )}
        </div>
        {columnBreak}
      </div>
    )
  },
  () => true,
)
