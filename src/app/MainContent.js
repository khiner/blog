import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import Sidebar from './Sidebar'
import SummaryList from './SummaryList'
import Entry from './Entry'
import { stripSlashes } from './utils'

import config from '../config'
import parsedEntries from './parsedEntries'

import Loadable from 'react-loadable'

function createContentLoadable(entry) {
  return Loadable({
    loader: () => import('../content/' + entry.contentPath),
    loading(props) {
      return <div>Loading...</div>
    },
    render(props) {
      if (entry.usesMath) {
        // allow LaTex formatting
        const mathJax = document.createElement('script')
        const mathJaxConfig = document.createElement('script')

        mathJax.src =
          'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS_HTML'
        mathJaxConfig.type = 'text/x-mathjax-config'
        mathJaxConfig.innerHTML = `MathJax.Hub.Config({
          tex2jax: {
              inlineMath: [ ['$','$'], ["\\\\(","\\\\)"] ],
              displayMath: [ ['$$','$$'], ["\\\\[","\\\\]"] ],
              processEscapes: true,
              processEnvironments: true
          },
          // Center justify equations in code and markdown cells. Elsewhere
          // we use CSS to left justify single line equations in code cells.
          displayAlign: 'center',
          "HTML-CSS": {
              styles: {'.MathJax_Display': {"margin": 0}},
              linebreaks: { automatic: true }
          }
        });`

        document.head.appendChild(mathJax)
        document.head.appendChild(mathJaxConfig)
      }

      return props.default
    },
  })
}

export default class MainContent extends Component {
  generateComponent(entry) {
    return props => {
      return (
        <Entry {...entry}>
          {entry.contentPath
            ? React.createElement(createContentLoadable(entry))
            : entry.content}
        </Entry>
      )
    }
  }

  generateRoute(entry) {
    return (
      <Route
        key={entry.path}
        path={`/${stripSlashes(entry.path)}`}
        render={this.generateComponent(entry)}
      />
    )
  }

  render() {
    return (
      <div className="contentWrapper">
        {config.entriesInSidebar && (
          <Sidebar
            shouldShow={this.props.shouldShowSidebar}
            toggle={this.props.toggleSidebar}
          />
        )}
        <Route exact path="/" component={SummaryList} />
        {parsedEntries.all.map(entry => this.generateRoute(entry))}
      </div>
    )
  }
}
