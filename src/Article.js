import React from 'react'
import Helmet from 'react-helmet'

import DiscussionEmbed from './DiscussionEmbed'

export default function Article(props) {
  const disqusShortname = 'karlhiner'
  const disqusConfig = {
    title: props.title,
    identifier: props.disqusId,
    url: props.url,
  }

  return (
    <div className="container">
      <Helmet title={`Karl Hiner - ${props.title}`} />
      <div className="col-md-2" />
      <div className="main-content col-xs-12 col-md-8">
        <h1>{props.title}</h1>
        <h2 className="date">{props.date}</h2>
        {props.children}
      </div>
      <div className="col-md-2" />
      {disqusConfig.identifier && (
        <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
      )}
    </div>
  )
}
