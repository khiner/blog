import React, { useEffect, useRef, useState } from 'react'
import adapter from 'webrtc-adapter' // eslint-disable-line no-unused-vars

import Link from '../Link'
import Paragraph from '../Paragraph'

import testSample from './assets/speech-male.wav'

// Starting point for this code from
// https://webrtc.github.io/samples/src/content/peerconnection/webaudio-input/

// peer connection
let pc = null
let dc = null

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

const NONE = 'None'
const MICROPHONE = 'Microphone'
const TEST_SAMPLE = 'TEST_SAMPLE'
const AUDIO_INPUT_SOURCES = [MICROPHONE, TEST_SAMPLE]

export default function JaxDsp() {
  const [audioInputSource, setAudioInputSource] = useState(MICROPHONE)
  const [isSending, setIsSending] = useState(false)
  const [isEstimating, setIsEstimating] = useState(false)
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
    if (dc) dc.send(JSON.stringify({ audio_processor_name: processorName }))
  }, [processorName])

  useEffect(() => {
    if (dc) dc.send(JSON.stringify({ param_values: paramValues }))
  }, [paramValues])

  const negotiate = async () => {
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await new Promise((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve()
      } else {
        function checkState() {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState)
            resolve()
          }
        }
        pc.addEventListener('icegatheringstatechange', checkState)
      }
    })
    pc.localDescription.sdp = sdpFilterCodec(
      'audio',
      'opus/48000/2',
      pc.localDescription.sdp
    )
    const response = await fetch('http://localhost:8080/offer', {
      body: JSON.stringify({
        sdp: pc.localDescription.sdp,
        type: pc.localDescription.type,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    const answer = await response.json()
    await pc.setRemoteDescription(answer)
  }

  // Returns true if track was added to the peer connection
  const addOrReplaceTrack = (track) => {
    const audioSender = pc
      .getSenders()
      .find((s) => s.track && s.track.kind === 'audio')
    if (audioSender) {
      audioSender.replaceTrack(track)
    } else {
      pc.addTrack(track)
      negotiate()
    }
  }

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false },
        video: false,
      })
      const microphoneTrack = stream.getTracks()[0]
      addOrReplaceTrack(microphoneTrack)
    } catch (error) {
      setIsSending(false)
      console.error(`Could not acquire media: ${error}`)
    }
  }

  // TODO use https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack
  // TODO set currentTIme = 0 after pc 'track' event
  const startTestSample = async () => {
    const testSampleAudio = new Audio(testSample)
    testSampleAudio.loop = true
    const audioContext = new AudioContext()
    const testSampleSource = audioContext.createMediaElementSource(
      testSampleAudio
    )
    const testSampleDestination = audioContext.createMediaStreamDestination()
    const testSampleTrack = testSampleDestination.stream.getAudioTracks()[0]
    testSampleSource.connect(testSampleDestination)

    testSampleAudio.currentTime = 0
    await testSampleAudio.play()
    addOrReplaceTrack(testSampleTrack)
  }

  useEffect(() => {
    if (!isSending) return

    if (audioInputSource === MICROPHONE) startMicrophone()
    else if (audioInputSource === TEST_SAMPLE) startTestSample()
  }, [audioInputSource])

  const startSending = () => {
    setIsSending(true)

    pc = new RTCPeerConnection()
    pc.addTransceiver('audio')
    dc = pc.createDataChannel('chat', { ordered: true })
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

    pc.addEventListener('track', (event) => {
      audioRef.current.srcObject = event.streams[0]
    })

    if (audioInputSource === MICROPHONE) startMicrophone()
    else if (audioInputSource === TEST_SAMPLE) startTestSample()
  }

  const stopSending = () => {
    setIsSending(false)

    pc.getSenders().forEach((sender) => {
      if (sender.track) sender.track.stop()
    })
    if (dc) dc.close()
    if (pc.getTransceivers) {
      pc.getTransceivers().forEach((transceiver) => {
        if (transceiver.stop) transceiver.stop()
      })
    }
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

  const processorParams =
    processors && processors[processorName] && processors[processorName].params
  const processorParamValues = (paramValues && paramValues[processorName]) || {}
  return (
    <div>
      <Paragraph>
        <Link href="https://github.com/khiner/jaxdsp/">JAXdsp</Link>
      </Paragraph>
      <div>
        <span>Audio input source:</span>{' '}
        <select
          value={audioInputSource}
          onChange={(event) => setAudioInputSource(event.target.value)}
        >
          {AUDIO_INPUT_SOURCES.map((audioInputSource) => (
            <option key={audioInputSource} value={audioInputSource}>
              {audioInputSource}
            </option>
          ))}
        </select>
      </div>
      {processors && (
        <div>
          <select
            value={processorName}
            onChange={(event) => setProcessorName(event.target.value)}
          >
            {[NONE, ...Object.keys(processors)].map((processorName) => (
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
          Start sending
        </button>
        <button disabled={!isSending} onClick={stopSending}>
          Stop sending
        </button>
      </div>
      <audio controls autoPlay ref={audioRef} hidden></audio>
    </div>
  )
}
