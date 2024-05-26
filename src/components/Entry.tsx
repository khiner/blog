import React, { useEffect } from 'react'
import { HelmetProvider, Helmet } from 'react-helmet-async'
import { Card } from 'react-bootstrap'

import config from 'config'

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
  function Entry({ title, subtitle, date, type, children }) {
    useEffect(() => {
      formatMathWhenContentIsReady()
    }, [])

    const isShowcase = type && type.toLowerCase() === 'showcase'
    const columnBreak = <div className="col-md-1 col-lg-2" />
    const formattedTitle = config.siteName && title ? `${config.siteName} - ${title}` : config.siteName || title

    return (
      <HelmetProvider>
        <div>
          <Helmet>
            <title>{formattedTitle}</title>
          </Helmet>
          {columnBreak}
          <div className="container col-xs-12 col-md-10 col-lg-8">
            {!isShowcase && (
              <div className="entry">
                {title && <h1 className="title">{title}</h1>}
                {subtitle && <h2 className="subtitle">{subtitle}</h2>}
                {date && <h3 className="date">{date}</h3>}
                {children}
              </div>
            )}
            {isShowcase && (
              <Card>
                <Card.Header>
                  <Header title={title} date={date} />
                </Card.Header>
                <Card.Body>
                  <div className="entry Showcase">{children}</div>
                </Card.Body>
              </Card>
            )}
          </div>
          {columnBreak}
        </div>
      </HelmetProvider>
    )
  },
  () => true,
)
