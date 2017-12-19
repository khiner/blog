import React from 'react'
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
      <div className="main-content">
        <Well id={props.wellId}>
          <div>
            <h1>{props.title}</h1>
            {props.children}
          </div>
        </Well>
      </div>
      <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
    </div>
  )
}
