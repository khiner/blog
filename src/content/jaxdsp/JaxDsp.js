import React, { useRef, useState } from 'react'
import adapter from 'webrtc-adapter' // eslint-disable-line no-unused-vars

import Link from '../Link'
import Paragraph from '../Paragraph'

// TODO this is the one: https://github.com/jlaine/aiortc/tree/99dd90f28ac6f0f1daadd7db20673c1f8736ff06/examples/server
//   - clone and run this locally
// TODO This also looks on point, but uses rtcbot library instead of plain jane: https://rtcbot.readthedocs.io/en/latest/examples/webrtc/README.html

// TODO use the data channel part of the aiortc server example:
//   https://github.com/aiortc/aiortc/blob/main/examples/server/client.js#L121-L145

// From https://webrtc.github.io/samples/src/content/peerconnection/webaudio-input/

// peer connection
let pc = null
let dc = null

const audioTransforms = ['none', 'freeverb', 'clip', 'delay_line']

const dataChannelParameters = {
  ordered: true,
}

function sdpFilterCodec(kind, codec, realSdp) {
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
  }

  const allowed = []
  const rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$')
  const codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec))
  const videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$')

  const lines = realSdp.split('\n')

  let isKind = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('m=' + kind + ' ')) {
      isKind = true
    } else if (lines[i].startsWith('m=')) {
      isKind = false
    }

    if (isKind) {
      var match = lines[i].match(codecRegex)
      if (match) {
        allowed.push(parseInt(match[1]))
      }

      match = lines[i].match(rtxRegex)
      if (match && allowed.includes(parseInt(match[2]))) {
        allowed.push(parseInt(match[1]))
      }
    }
  }

  const skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)'
  let sdp = ''

  isKind = false
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('m=' + kind + ' ')) {
      isKind = true
    } else if (lines[i].startsWith('m=')) {
      isKind = false
    }

    if (isKind) {
      const skipMatch = lines[i].match(skipRegex)
      if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) {
        continue
      } else if (lines[i].match(videoRegex)) {
        sdp += lines[i].replace(videoRegex, '$1 ' + allowed.join(' ')) + '\n'
      } else {
        sdp += lines[i] + '\n'
      }
    } else {
      sdp += lines[i] + '\n'
    }
  }

  return sdp
}

export default function JaxDsp() {
  const [startEnabled, setStartEnabled] = useState(true)
  const [stopEnabled, setStopEnabled] = useState(false)
  const [audioTransform, setAudioTransform] = useState('none')
  const audioRef = useRef(null)
  const start = () => {
    setStartEnabled(false)
    setStopEnabled(true)

    pc = new RTCPeerConnection({ sdpSemantics: 'unified-plan' })
    pc.addEventListener(
      'track',
      (event) => (audioRef.current.srcObject = event.streams[0])
    )

    dc = pc.createDataChannel('chat', dataChannelParameters)
    dc.onopen = () => {
      dc.send('ping')
      console.log('sent ping')
    }
    dc.onmessage = (event) => {
      console.log('dc.onmessage: ', event.data)
    }

    navigator.mediaDevices
      .getUserMedia({
        audio: {
          // sampleSize: 8,
          echoCancellation: false,
        },
        video: false,
      })
      .then(
        (stream) => {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream))
          return pc
            .createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              // wait for ICE gathering to complete
              return new Promise((resolve) => {
                if (pc.iceGatheringState === 'complete') {
                  resolve()
                } else {
                  function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                      pc.removeEventListener(
                        'icegatheringstatechange',
                        checkState
                      )
                      resolve()
                    }
                  }
                  pc.addEventListener('icegatheringstatechange', checkState)
                }
              })
            })
            .then(() => {
              const offer = pc.localDescription
              offer.sdp = sdpFilterCodec('audio', 'opus/48000/2', offer.sdp)
              return fetch('http://localhost:8080/offer', {
                body: JSON.stringify({
                  sdp: offer.sdp,
                  type: offer.type,
                  audio_transform: audioTransform,
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
                method: 'POST',
              })
            })
            .then((response) => response.json())
            .then((answer) => pc.setRemoteDescription(answer))
            .catch((error) => console.error(error))
        },
        (error) => {
          setStartEnabled(true)
          setStopEnabled(false)
          console.error(`Could not acquire media: ${error}`)
        }
      )
  }

  const stop = () => {
    setStartEnabled(true)
    setStopEnabled(false)

    if (dc) dc.close()
    if (pc.getTransceivers) {
      pc.getTransceivers().forEach((transceiver) => {
        if (transceiver.stop) transceiver.stop()
      })
    }
    pc.getSenders().forEach((sender) => sender.track.stop())
    setTimeout(() => pc.close(), 500)
  }

  return (
    <div>
      <Paragraph>
        <Link href="https://github.com/khiner/jaxdsp/">JAXdsp</Link>
      </Paragraph>
      <audio controls autoPlay ref={audioRef}></audio>

      <h2>Options</h2>
      <div>
        <select
          value={audioTransform}
          onChange={(event) => setAudioTransform(event.target.value)}
        >
          {audioTransforms.map((audioTransformOption) => (
            <option key={audioTransformOption} value={audioTransformOption}>
              {audioTransformOption}
            </option>
          ))}
        </select>
      </div>

      <button disabled={!startEnabled} onClick={start}>
        Start
      </button>
      <button disabled={!stopEnabled} onClick={stop}>
        Stop
      </button>
    </div>
  )
}
