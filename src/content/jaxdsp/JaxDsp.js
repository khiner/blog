import React, { useEffect, useRef, useState } from 'react'
import adapter from 'webrtc-adapter' // eslint-disable-line no-unused-vars

import Link from '../Link'
import Paragraph from '../Paragraph'

import testSample from './assets/speech-male.wav'

// Starting point for this code from:
// https://webrtc.github.io/samples/src/content/peerconnection/webaudio-input/

let peerConnection = null
let dataChannel = null

// TODO copied wholesale. I think I don't need a lot of this.
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

async function negotiate() {
  const offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)
  await new Promise(resolve => {
    if (peerConnection.iceGatheringState === 'complete') {
      resolve()
    } else {
      function checkState() {
        if (peerConnection.iceGatheringState === 'complete') {
          peerConnection.removeEventListener('icegatheringstatechange', checkState)
          resolve()
        }
      }
      peerConnection.addEventListener('icegatheringstatechange', checkState)
    }
  })
  peerConnection.localDescription.sdp = sdpFilterCodec(
    'audio',
    'opus/48000/2',
    peerConnection.localDescription.sdp
  )
  const response = await fetch('http://localhost:8080/offer', {
    body: JSON.stringify({
      sdp: peerConnection.localDescription.sdp,
      type: peerConnection.localDescription.type,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  const answer = await response.json()
  await peerConnection.setRemoteDescription(answer)
}

const NONE = 'None'
const MICROPHONE = 'Microphone'
const TEST_SAMPLE = 'TEST_SAMPLE'
const AUDIO_INPUT_SOURCES = [MICROPHONE, TEST_SAMPLE]

export default function JaxDsp() {
  const [audioInputSource, setAudioInputSource] = useState(MICROPHONE)
  const [isStreamingAudio, setIsStreamingAudio] = useState(false)
  const [isEstimatingParams, setIsEstimatingParams] = useState(false)
  const [processorName, setProcessorName] = useState(NONE)
  const [processors, setProcessors] = useState(null)
  const [paramValues, setParamValues] = useState({})
  const [estimatedParamValues, setEstimatedParamValues] = useState({})

  const updateParamValue = (paramName, value) => {
    const newParamValues = { ...paramValues }
    if (newParamValues[processorName]) {
      newParamValues[processorName][paramName] = value
    }
    setParamValues(newParamValues)
  }

  const audioRef = useRef(null)

  useEffect(() => {
    dataChannel?.send(JSON.stringify({ audio_processor_name: processorName }))
  }, [processorName])

  useEffect(() => {
    dataChannel?.send(JSON.stringify({ param_values: paramValues }))
  }, [paramValues])

  useEffect(() => {
    if (isStreamingAudio && !peerConnection) {
      peerConnection = new RTCPeerConnection()
      peerConnection.addTransceiver('audio')
      dataChannel = peerConnection.createDataChannel('chat', { ordered: true })
      dataChannel.onopen = () => dataChannel.send('get_config')
      dataChannel.onmessage = event => {
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

      peerConnection.addEventListener('track', event => (audioRef.current.srcObject = event.streams[0]))
    } else if (!isStreamingAudio && peerConnection) {
      peerConnection.getSenders().forEach(sender => sender?.track?.stop())
      dataChannel?.close()
      peerConnection.getTransceivers()?.forEach(transceiver => transceiver.stop())
      peerConnection.close()
      peerConnection = null
    }

    if (isStreamingAudio) {
      const addOrReplaceTrack = track => {
        const audioSender = peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio')
        if (audioSender) {
          audioSender.replaceTrack(track)
        } else {
          peerConnection.addTrack(track)
          negotiate()
        }
      }

      const startStreamingMicrophone = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: false },
            video: false,
          })
          const microphoneTrack = stream.getTracks()[0]
          addOrReplaceTrack(microphoneTrack)
        } catch (error) {
          setIsStreamingAudio(false)
          console.error(`Could not acquire media: ${error}`)
        }
      }

      const startStreamingTestSample = () => {
        const testSampleAudio = new Audio(testSample)
        const audioContext = new AudioContext()
        const testSampleSource = audioContext.createMediaElementSource(testSampleAudio)
        const testSampleDestination = audioContext.createMediaStreamDestination()
        testSampleSource.connect(testSampleDestination)

        const testSampleTrack = testSampleDestination.stream.getAudioTracks()[0]
        addOrReplaceTrack(testSampleTrack)

        testSampleAudio.loop = true
        testSampleAudio.currentTime = 0
        testSampleAudio.play()
      }

      if (audioInputSource === MICROPHONE) startStreamingMicrophone()
      else if (audioInputSource === TEST_SAMPLE) startStreamingTestSample()
    }
  }, [isStreamingAudio, audioInputSource])

  const startEstimatingParams = () => {
    setIsEstimatingParams(true)
    if (dataChannel) dataChannel.send('start_estimating_params')
  }

  const stopEstimatingParams = () => {
    setIsEstimatingParams(false)
    if (dataChannel) dataChannel.send('stop_estimating_params')
  }

  const processorParams = processors && processors[processorName] && processors[processorName].params
  const processorParamValues = (paramValues && paramValues[processorName]) || {}
  return (
    <div>
      <Paragraph>
        <Link href="https://github.com/khiner/jaxdsp/">JAXdsp</Link>
      </Paragraph>
      <div>
        <span>Audio input source:</span>{' '}
        <select value={audioInputSource} onChange={event => setAudioInputSource(event.target.value)}>
          {AUDIO_INPUT_SOURCES.map(audioInputSource => (
            <option key={audioInputSource} value={audioInputSource}>
              {audioInputSource}
            </option>
          ))}
        </select>
      </div>
      {processors && (
        <div>
          <select value={processorName} onChange={event => setProcessorName(event.target.value)}>
            {[NONE, ...Object.keys(processors)].map(processorName => (
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
            <button disabled={isEstimatingParams} onClick={startEstimatingParams}>
              Start estimating
            </button>
            <button disabled={!isEstimatingParams} onClick={stopEstimatingParams}>
              Stop estimating
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div>
              {processorParams.map(({ name, default_value, min_value, max_value }) => (
                <div key={name}>
                  <input
                    type="range"
                    name={name}
                    value={processorParamValues[name] || default_value || 0.0}
                    min={min_value}
                    max={max_value}
                    step={(max_value - min_value) / 100.0}
                    onChange={event => updateParamValue(name, +event.target.value)}
                  />
                  <label htmlFor={name}>{name}</label>
                </div>
              ))}
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
                          onChange={event => updateParamValue(name, +event.target.value)}
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
        <button disabled={isStreamingAudio} onClick={() => setIsStreamingAudio(true)}>
          Start sending
        </button>
        <button disabled={!isStreamingAudio} onClick={() => setIsStreamingAudio(false)}>
          Stop sending
        </button>
      </div>
      <audio controls autoPlay ref={audioRef} hidden></audio>
    </div>
  )
}