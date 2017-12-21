import React, { Component } from 'react'
import { Route } from 'react-router-dom'

import SummaryList from './SummaryList'
import Article from './Article'
import ShowcaseWell from './ShowcaseWell'
import entries from './entries'
import { stripSlashes } from './utils'

class MainContent extends Component {
  generateComponent(entry) {
    return props => {
      if (entry.type && entry.type.toLowerCase() === 'showcase') {
        return (
          <ShowcaseWell
            title={entry.title}
            date={entry.date}
            url={entry.url}
            disqusId={entry.disqusId}>
            {entry.content}
          </ShowcaseWell>
        )
      } else {
        return (
          <Article
            title={entry.title}
            date={entry.date}
            url={entry.url}
            disqusId={entry.disqusId}>
            {entry.content}
          </Article>
        )
      }
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
      <div>
        <Route exact path="/" component={SummaryList} />
        {entries.map(entry => this.generateRoute(entry))}
      </div>
    )
  }
}

export default MainContent
