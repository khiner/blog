import React from 'react';

import DiscussionEmbed from './DiscussionEmbed';

export default function Article(props) {
  const disqusShortname = 'karlhiner';
  const disqusConfig = {
      title: props.title,
      identifier: props.disqusId,
      url: props.url,
  };

  return (
    <div class='container'>
      <div class='col-md-2'></div>
      <div class='main-content col-xs-12 col-md-8'>
        <h1>{props.title}</h1>
        {props.children}
      </div>
      <div class='col-md-2'></div>
      <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
    </div>
  )
}
