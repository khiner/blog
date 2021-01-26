import React, { useEffect, useRef, useState } from 'react'
import adapter from 'webrtc-adapter' // eslint-disable-line no-unused-vars

import Link from '../Link'
import Paragraph from '../Paragraph'

// Starting point for this code from
// https://webrtc.github.io/samples/src/content/peerconnection/webaudio-input/

// peer connection
let pc = null
let dc = null

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
  const [isSending, setIsSending] = useState(false)
  const [useTestSignal, setUseTestSignal] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
  const [processorName, setProcessorName] = useState('None')
  const [processors, setProcessors] = useState(null)
  const [paramValues, setParamValues] = useState({})
  const [estimatedParamValues, setEstimatedParamValues] = useState({})

  const updateParamValue = (paramName, value) => {
    const newParamValues = { ...paramValues }
    console.log(newParamValues)
    console.log(processorName)
    if (newParamValues[processorName]) {
      newParamValues[processorName][paramName] = value
    }
    setParamValues(newParamValues)
  }

  const audioRef = useRef(null)

  useEffect(() => {
    if (dc) dc.send(JSON.stringify({ audio_processor_name: processorName }))
  }, [processorName])

  useEffect(() => {
    if (dc) dc.send(JSON.stringify({ param_values: paramValues }))
  }, [paramValues])

  const startSending = () => {
    setIsSending(true)

    pc = new RTCPeerConnection({ sdpSemantics: 'unified-plan' })
    pc.addEventListener(
      'track',
      (event) => (audioRef.current.srcObject = event.streams[0])
    )

    dc = pc.createDataChannel('chat', dataChannelParameters)
    dc.onopen = () => {
      dc.send('get_config')
    }
    dc.onmessage = (event) => {
      const message = JSON.parse(event.data)
      const {
        processors,
        param_values: paramValues,
        estimated_param_values: estimatedParamValues,
      } = message

      if (processors) {
        console.log('Received processor descriptions:')
        console.log(processors)
        setProcessors(processors)
      }
      if (paramValues) {
        console.log('Received parameter values:')
        console.log(paramValues)
        setParamValues(paramValues)
      }
      if (estimatedParamValues) {
        console.log('Received estimated parameter values:')
        console.log(estimatedParamValues)
        setEstimatedParamValues(estimatedParamValues)
      }
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
          setIsSending(false)
          console.error(`Could not acquire media: ${error}`)
        }
      )
  }

  const stopSending = () => {
    setIsSending(false)

    if (dc) dc.close()
    if (pc.getTransceivers) {
      pc.getTransceivers().forEach((transceiver) => {
        if (transceiver.stop) transceiver.stop()
      })
    }
    pc.getSenders().forEach((sender) => sender.track.stop())
    setTimeout(() => pc.close(), 500)
  }

  const startEstimating = () => {
    setIsEstimating(true)
    if (dc) dc.send('start_estimating_params')
  }

  const stopEstimating = () => {
    setIsEstimating(false)
    if (dc) dc.send('stop_estimating_params')
  }

  const startUsingTestSignal = () => {
    setUseTestSignal(true)
    if (dc) dc.send('use_test_signal')
  }

  const stopUsingTestSignal = () => {
    setUseTestSignal(false)
    if (dc) dc.send('use_test_signal')
  }

  const processorParams =
    processors && processors[processorName] && processors[processorName].params
  const processorParamValues = (paramValues && paramValues[processorName]) || {}
  return (
    <div>
      <Paragraph>
        <Link href="https://github.com/khiner/jaxdsp/">JAXdsp</Link>
      </Paragraph>
      <audio controls autoPlay ref={audioRef}></audio>
      <div>
        <button disabled={useTestSignal} onClick={startUsingTestSignal}>
          Use test signal
        </button>
        <button disabled={!useTestSignal} onClick={stopUsingTestSignal}>
          Stop using test signal
        </button>
      </div>
      {processors && (
        <div>
          <select
            value={processorName}
            onChange={(event) => setProcessorName(event.target.value)}
          >
            {['None', ...Object.keys(processors)].map((processorName) => (
              <option key={processorName} value={processorName}>
                {processorName}
              </option>
            ))}
          </select>
        </div>
      )}
      {processorParams && (
        <div>
          <div>
            <button disabled={isEstimating} onClick={startEstimating}>
              Start estimating
            </button>
            <button disabled={!isEstimating} onClick={stopEstimating}>
              Stop estimating
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div>
              {processorParams.map(
                ({ name, default_value, min_value, max_value }) => (
                  <div key={name}>
                    <input
                      type="range"
                      name={name}
                      value={processorParamValues[name] || default_value || 0.0}
                      min={min_value}
                      max={max_value}
                      step={(max_value - min_value) / 100.0}
                      onChange={(event) =>
                        updateParamValue(name, +event.target.value)
                      }
                    />
                    <label htmlFor={name}>{name}</label>
                  </div>
                )
              )}
            </div>
            {estimatedParamValues && (
              <div>
                {processorParams.map(
                  ({ name, min_value, max_value }) =>
                    !isNaN(estimatedParamValues[name]) && (
                      <div key={name}>
                        <input
                          type="range"
                          name={name}
                          value={estimatedParamValues[name]}
                          min={min_value}
                          max={max_value}
                          step={(max_value - min_value) / 100.0}
                          onChange={(event) =>
                            updateParamValue(name, +event.target.value)
                          }
                          disabled
                        />
                        <label htmlFor={name}>{name}</label>
                      </div>
                    )
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div>
        <button disabled={isSending} onClick={startSending}>
          Start
        </button>
        <button disabled={!isSending} onClick={stopSending}>
          Stop
        </button>
      </div>
    </div>
  )
}
