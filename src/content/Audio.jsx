export default function Audio({ src, type = 'audio/wav' }) {
  return (
    <audio controls="controls">
      <source src={src} type={type} />
      Your browser does not support the audio tag.
    </audio>
  )
}
