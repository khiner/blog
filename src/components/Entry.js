import React, { useEffect } from 'react'
import Helmet from 'react-helmet'
import { Card } from 'react-bootstrap'

import config from '../config'

function formatMathWhenContentIsReady() {
  const element = document.getElementById('loadedContent')
  if (typeof element === 'undefined' || element === null) {
    window.requestAnimationFrame(formatMathWhenContentIsReady)
  } else if (window.MathJax) {
    window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, 'MathOutput'])
  }
}

const Header = ({ title, date }) => (
  <div>
    <h1 className="title">{title}</h1>
    <h2 className="date">{date}</h2>
  </div>
)

export default React.memo(
  function Entry({ title, subtitle, description, descriptionPlainText, url, date, type, children }) {
    useEffect(() => {
      formatMathWhenContentIsReady()
    }, [])

    const isShowcase = type && type.toLowerCase() === 'showcase'
    const columnBreak = <div className="col-md-1 col-lg-2" />

    let formattedTitle
    if (config.siteName && title) {
      formattedTitle = config.siteName + ' - ' + title
    } else if (config.siteName) {
      formattedTitle = config.siteName
    } else if (title) {
      formattedTitle = title
    }

    return (
      <div>
        <Helmet title={formattedTitle} />
        {columnBreak}
        <div className="container col-xs-12 col-md-10 col-lg-8">
          {!isShowcase && (
            <div id="mainContent" className="mainContent">
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
                <div className="mainContent Showcase">{children}</div>
              </Card.Body>
            </Card>
          )}
        </div>
        {columnBreak}
      </div>
    )
  },
  () => true
)
