import React, { Component } from 'react'
import Article from '../Article'

export default class JupyterNotebooks extends Component {
  render() {
    return (
      <Article>
        <div>
          <a
            href="https://nbviewer.jupyter.org/github/khiner/notebooks/blob/master/test_audio.ipynb"
            target="_blank"
            rel="noopener noreferrer">
            Test Audio
          </a>{' '}
          is an example of outputting audio using Numpy arrays.
        </div>
      </Article>
    )
  }
}
