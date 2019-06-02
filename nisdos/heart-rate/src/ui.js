import React, { Component } from 'react'

let width, height, hist = [], videoContext, graphContext

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
    }

    this.localStream = null

    this.toggle = this.toggle.bind(this)
    this.close = this.close.bind(this)
    this.start = this.start.bind(this)
    this.draw = this.draw.bind(this)
  }

  toggle () {
    const { isShown } = this.state
    this.setState({isShown: !isShown}, () => {
      if (this.localStream) {
        this.init(this.localStream)
      }
    })
  }

  close () {
    this.setState({isShown: false})
  }

  start () {

    const { isInDaChat, getSystemStream } = this.props

    const video = {
      facingMode: 'environment',
      optional: [{ fillLightMode: 'on' }],
    }

    window.navigator.mediaDevices.getUserMedia({ video, audio: false }).then(stream => {
      this.init(stream)
    }, () => {
      const stream = getSystemStream()

      if (stream) {
        this.init(stream)
      } else {
        alert('It looks like all the cameras are blocked')
      }
    })
  }

  init (stream) {
    this.localStream = stream
    this.video.srcObject = stream
    this.video.play()

    setTimeout(() => {
      width = this.video.videoWidth
      height = this.video.videoHeight

      videoContext = this.videoCanvas.getContext('2d')
      graphContext = this.graphCanvas.getContext('2d')

      window.requestAnimationFrame(this.draw)
    }, 300)
  }

  draw () {

    const frame = this.readFrame()
    if (frame) {
      this.getIntensity(frame.data)
    }

    // Wait for the next frame.
    window.requestAnimationFrame(this.draw)
  }

  readFrame() {
    try {
      videoContext.drawImage(this.video, 0, 0, width, height, 0, 0, 320, 160)
    } catch (e) {
      return null
    }

    return videoContext.getImageData(0, 0, 100, 100)
  }

  getIntensity (data) {

    let sum = 0
    const len = data.length

    for (let i = 0, j = 0; j < len; i++, j += 4) {
      sum += data[j] + data[j + 1] + data[j + 2]
    }

    hist.push({ bright: sum / len, time: Date.now() })
    while (hist.length > this.graphCanvas.width) hist.shift()

    // max and min
    let max = hist[0].bright
    let min = hist[0].bright
    hist.forEach(function (v) {
      if (v.bright > max) max = v.bright
      if (v.bright < min) min = v.bright
    })

    // thresholds for bpm
    let lo = min * 0.6 + max * 0.4
    let hi = min * 0.4 + max * 0.6
    let pulseAvr = 0, pulseCnt = 0

    // draw
    const ctx = graphContext
    ctx.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    hist.forEach((v, x) => {
      const y = this.graphCanvas.height * (v.bright - min) / (max - min)
      ctx.lineTo(x, y)
    })
    ctx.stroke()

    // work out bpm
    let isHi = undefined
    let lastHi = undefined
    let lastLo = undefined
    ctx.fillStyle = 'red'
    hist.forEach((v, x) => {
      if (isHi !== true && v.bright > hi) {
        isHi = true
        lastLo = x
      }
      if (isHi !== false && v.bright < lo) {
        if (lastHi !== undefined && lastLo !== undefined) {
          pulseAvr += hist[x].time - hist[lastHi].time
          pulseCnt++
          ctx.fillRect(lastLo, this.graphCanvas.height - 4, lastHi - lastLo, 4)
        }
        isHi = false
        lastHi = x
      }
    })

    // write bpm
    if (pulseCnt) {
      const pulseRate = 60000 / (pulseAvr / pulseCnt)
      this.bpm.innerHTML = pulseRate.toFixed(0) + ' BPM (' + pulseCnt + ' pulses)'
    } else {
      this.bpm.innerHTML = '-- BPM'
    }
  }

  render () {

    const { i18n } = this.props
    const { isShown } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui}>
        <div style={styles.box}>
          <video ref={c => this.video = c} height="100" style={{display: 'none'}} muted/>
          <canvas ref={c => this.videoCanvas = c} style={{width: '100px', height: '100px', filter: 'blur(6px)', borderRadius: '100px'}} />
          <canvas ref={c => this.graphCanvas = c} width="320" height="30" />

          <div ref={c => this.bpm = c} />

          <button
            onClick={this.start}
            style={styles.button}
          >
            { 'Start' }
          </button>
          <button
            onClick={this.close}
            style={styles.button}
          >
            { 'Close' }
          </button>
        </div>
      </div>
    )
  }
}

const styles = {
  ui: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '480px',
    maxWidth: '100vw',
    padding: '16px',
    background: '#fff',
  },
  button: {
    marginTop: '8px',
  },
}

export default UI
