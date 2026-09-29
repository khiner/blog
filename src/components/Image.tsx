import type { CSSProperties } from 'preact/compat'

interface ImageProps {
  src: string
  alt?: string
  style?: CSSProperties
}

export default ({ src, alt = '', style = { maxWidth: 900 } }: ImageProps) => (
  <img className="wide-media" src={src} alt={alt} style={style} />
)
