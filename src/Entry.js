import React from 'react'
import Helmet from 'react-helmet'

import DiscussionEmbed from './DiscussionEmbed'

export default function Entry(props) {
  const disqusShortname = 'karlhiner'
  const disqusConfig = {
    title: props.title,
    identifier: props.disqusId,
    url: props.url,
  }
  const isShowcase = props.type && props.type.toLowerCase() === 'showcase'
  const columnBreak = <div className={isShowcase ? 'col-md-1' : 'col-md-2'} />

  return (
    <div className="container">
      <Helmet title={`Karl Hiner - ${props.title}`} />
      {columnBreak}
      <div
        className={
          'main-content col-xs-12 ' +
          (isShowcase ? 'col-md-10 Showcase well' : 'col-md-8')
        }>
        <h1>{props.title}</h1>
        <h2 className="date">{props.date}</h2>
        {props.children}
      </div>
      {columnBreak}
      {disqusConfig.identifier && (
        <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
      )}
    </div>
  )
}
