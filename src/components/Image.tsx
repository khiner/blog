export default ({ src, alt = '', style = { maxWidth: 900 } }) => (
  <img className="responsive wide" src={src} alt={alt} style={style} />
)
