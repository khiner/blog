import React, { Component } from 'react'

export default class Link extends Component {
  render() {
    const { href } = this.props

    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {this.props.children}
      </a>
    )
  }
}
