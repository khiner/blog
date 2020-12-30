import React from 'react'
import { Link } from 'react-router-dom'
import ExternalLink from '../Link'
import Paragraph from '../Paragraph'
import SyntaxHighlighter from 'react-syntax-highlighter';

import rolling_your_own_cms from './assets/rolling_your_own_cms.jpg'
import site_generator_demo from './assets/site_generator_demo.gif'

function getBody() {
  return document.getElementsByTagName('body')[0]
}

function toggleNineties() {
  const body = getBody()
  if (getBody().className === 'nineties') {
    body.className = ''
    document.getElementById('decadeLabel').textContent = 'like the 90s'
  } else {
    body.className = 'nineties'
    document.getElementById('decadeLabel').textContent = 'sane again'
  }
}

export default (
  <div>
    <Paragraph>
      <ExternalLink href="https://www.npmjs.com/package/react-scripts-bootstrap-site-generator">
        <i>React Bootstrap Site Generator</i>
      </ExternalLink>{' '}
      is an npm package that builds on top of the{' '}
      <ExternalLink href="https://github.com/khiner/create-react-app">
        Create React App
      </ExternalLink>{' '}
      tool. It is a simple, opinionated static site generator designed to make creating
      simple sites like this one super fast.
    </Paragraph>
    <Paragraph>
      I built it with these goals in mind:
      <ul>
        <li>
          Make it as quick as possible to get something meaningful in the
          browser
        </li>
        <li>
          Make adding new content as quick as possible, while still allowing
          content to be arbitrarily complex
        </li>
        <li>
          Separate form from content - writing a new entry should only require
          touching one file for the usual case
        </li>
        <li>
          Automate the boring stuff - nested nav generation, site and page
          metadata for search engine crawlers, static HTML generation, browser
          tab titles
        </li>
        <li>Automatic social media stuff per-post</li>
        <li>
          Straightforward deployment: run{' '}
          <code>npm build</code> and <code>scp</code> the build directory to my
          hosting service's{' '}
          <code>public_html</code> directory
        </li>
        <li>
          A modern stack with all the trimmings, including a precommit hook for
          automatic style-enforcement and sass support with file watching
        </li>
      </ul>
    </Paragraph>
    <h4>
      <i>
        So why god why not just write stuff on Wordpress or Medium and be done
        with it?
      </i>
    </h4>
    <img
      src={rolling_your_own_cms}
      alt="O'Reilly: Rolling your own CMS for no good reason"
      style={{ width: '50%' }}
    />
    <Paragraph>
      Well because c'mon, who wouldn't rather have their own domain where they
      can have control over every pixel on the screen, rather than dealing with
      some WYSIWYG editor in the browser and playing by the rules of the MAN?!
    </Paragraph>
    <Paragraph>
      More reasons:
      <ul>
        <li>
          You can{' '}
          <button className="linkButton" onClick={toggleNineties}>
            make the whole site look <span id="decadeLabel">like the 90s</span>
          </button>{' '}
          if you want.
        </li>
      </ul>
    </Paragraph>
    <Paragraph>
      Now that we all agree making your own site is still a desirable thing to
      do in 20-whatever, let's talk about how!
    </Paragraph>
    <h2>My journey building a content hub</h2>
    <h3>Squarespace</h3>
    <Paragraph>
      Originally I subscribed to Squarespace account where I posted simple
      blog-style content.
    </Paragraph>
    <h3>Squarespace + manual hosting</h3>
    <Paragraph>
      I started this site to add other content like{' '}
      <Link to="/processing/retrograde_motion">Processing sketches</Link> that
      Squarespace isn't well-suited to host. I built it using raw HTML, CSS and
      JS for simplicity and control, but also because I wanted it to be served
      statically from the Namecheap hosting I bought. I love React, but it kind
      of felt like overkill and it serves pages dynamically, meaning direct
      links won't resolve since the directory won't be actually serving up an{' '}
      <code>index.hml</code> file and thus won't load unless you visit the site
      index and follow a <code>Route</code> link. (<i>More on this in a bit!</i>
      )
    </Paragraph>
    <Paragraph>
      Honestly though, I mostly just thought it was refreshing and fun to write
      things barebones after working so much with more complex stacks at my day
      job.
    </Paragraph>
    <h3>Manual hosting only</h3>
    <Paragraph>
      It started to feel silly to have two places for content, so I moved the
      Squarespace posts over here and stole the CSS styles I liked.
    </Paragraph>
    <Paragraph>
      After adding more content, I was getting fed up with the amount of
      duplication involved. I was avoiding a lot of it using simple tactics like
      this for each page:
      <SyntaxHighlighter language="xml">
        {`<script type="text/javascript">
  $(document).ready(function() {
    $('#main_nav').load('../../../main_nav.html');
    $('.main-content').load('main_content.html');
  });
</script>`}
      </SyntaxHighlighter>
      and putting the raw content of each post into its own{' '}
      <code>main_content.html</code>.
    </Paragraph>
    <Paragraph>
      But there were a lot of shortcomings:
      <ul>
        <li>
          I still had a ton of duplication in the form of html <code>head</code>{' '}
          tags and other random junk.
        </li>
        <li>
          Making structural changes to each post still required changing HTML
          everywhere, and there was no easy way around this.
        </li>
        <li>
          Managing js dependencies and versions and running a local server
          manually was a pain and felt really outdated.
        </li>
        <li>
          I was really missing object-oriented patterns like inheritance and composition.
        </li>
      </ul>
      Basically, I didn't have the setup I wanted - one that would allow me to focus
      on content alone. When adding new things, I usually had to edit multiple
      files. I could not easily add more complex features, like a post summary list
      page.
    </Paragraph>
    <h3>Rewriting in React</h3>
    <Paragraph>
      I decided to do a rewrite. I didn't want to to incur the learning overhead
      and unnecessary complexity of another site generator like{' '}
      <ExternalLink href="https://github.com/jekyll/jekyll">
        Jekyll
      </ExternalLink>
      . I wanted to work with common tools that I'm already comfortable with,
      using and developing skills that are transferable to other projects in my
      career. I've also developed a healthy fear of running into arbitrary
      limitations with strict frameworks.
    </Paragraph>
    <Paragraph>
      I love React, but it has this whole dynamic routing issue I mentioned
      above. However! I found this amazing tool,{' '}
      <ExternalLink href="https://github.com/geelen/react-snapshot">
        react-snapshot
      </ExternalLink>
      , that performs static prerendering on React apps by crawling the site and
      generating html for each page! Problem solved.
    </Paragraph>
    <Paragraph>
      I used{' '}
      <ExternalLink href="https://github.com/khiner/create-react-app">
        Create React App
      </ExternalLink>{' '}
      and{' '}
      <ExternalLink href="https://react-bootstrap.github.io/">
        React Bootstrap
      </ExternalLink>{' '}
      to spin up a new site, and copied the content over. Now that I had nice
      object-oriented tools at my disposal, I was able to solve my larger goal
      of building a system that allows me to focus on content independently of
      form and architecture.
    </Paragraph>
    <h2>Using the tool</h2>
    I've shared the{' '}
    <ExternalLink href="https://github.com/khiner/react-scripts-bootstrap-site-generator">
      framework
    </ExternalLink>{' '}
    as a <code>react-script</code> to be used directly with{' '}
    <code>create-react-app</code>. It's inteded more as a starting point than a
    framework. In the simplest cases, if your needs are similar to mine, you can
    get away with only modifying a couple files (<code>entries.js</code> and{' '}
    <code>config.js</code>
    ), but more likely you'll want to modify the site-generation code in{' '}
    <code>src/app</code> to suit your own needs.
    <h3>Setting up a new site</h3>
    <SyntaxHighlighter language="shell">
      {`$ npm install -g create-react-app
$ create-react-app my-app --scripts-version react-scripts-bootstrap-site-generator
$ cd my-app
$ npm install
$ npm start`}
    </SyntaxHighlighter>
    <Paragraph>
      That's it! Your browser should load a new tab to{' '}
      <code>localhost:3000</code> and you'll be greeted with the example app:
      <img
        src={site_generator_demo}
        alt="Demo gif of site generator"
        style={{ width: '75%' }}
      />
    </Paragraph>
    <Paragraph>
      See the{' '}
      <ExternalLink href="https://github.com/khiner/react-scripts-bootstrap-site-generator">
        project README
      </ExternalLink>{' '}
      for all the details and documentation, including how to modify and add new
      content and posts to the generated site, and how to build and deploy.
    </Paragraph>
    <Paragraph>
      I hope this saves someone time setting up their next site! If you have any
      questions, comments or bugs, comment below or contact me directly!
    </Paragraph>
  </div>
)
