import { Monitor } from 'jaxdsp-client'

import Link from '../Link'
import Paragraph from '../Paragraph'

import testSample from './assets/speech-male.wav'

export default function JaxDsp() {
  return (
    <div>
      <Paragraph>
        <Link href="https://github.com/khiner/jaxdsp/">JAXdsp</Link>
      </Paragraph>
      <Monitor testSample={testSample} />
    </div>
  )
}
