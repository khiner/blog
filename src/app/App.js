import React, { Component } from 'react'

import MainNav from './MainNav'
import MainContent from './MainContent'

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      shouldShowSidebar: false,
    }
  }

  componentDidMount() {
    // TODO: only add mathJax for Jupyter notebooks (or somehow make a package.json dep instead)
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

  toggleSidebar = () => {
    this.setState({ shouldShowSidebar: !this.state.shouldShowSidebar })
  }

  render() {
    return (
      <div>
        <MainNav onShowSidebarClicked={this.toggleSidebar} />
        <MainContent
          shouldShowSidebar={this.state.shouldShowSidebar}
          toggleSidebar={this.toggleSidebar}
        />
      </div>
    )
  }
}
