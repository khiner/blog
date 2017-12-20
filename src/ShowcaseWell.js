import React from 'react'
import Helmet from 'react-helmet'

import { Well } from 'react-bootstrap'

import DiscussionEmbed from './DiscussionEmbed'

export default function ShowcaseWell(props) {
  const disqusShortname = 'karlhiner'
  const disqusConfig = {
    title: props.title,
    identifier: props.disqusId,
    url: props.url,
  }

  return (
    <div className="container">
      <Helmet title={`Karl Hiner - ${props.title}`} />
      <div className="main-content">
        <Well id={props.wellId}>
          <div>
            <h1>{props.title}</h1>
            <h2 className="date">{props.date}</h2>
            {props.children}
          </div>
        </Well>
      </div>
      {disqusConfig.identifier && (
        <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
      )}
    </div>
  )
}
