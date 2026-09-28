import type { CSSProperties } from 'react'

interface ImageProps {
  src: string
  alt?: string
  style?: CSSProperties
}

export default ({ src, alt = '', style = { maxWidth: 900 } }: ImageProps) => (
  <img className="responsive wide" src={src} alt={alt} style={style} />
)
