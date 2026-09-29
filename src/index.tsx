import { render } from 'preact'
import App from 'components/App'

if (import.meta.env.DEV) await import('preact/debug')

render(<App />, document.getElementById('root'))
