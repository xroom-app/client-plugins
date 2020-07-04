import React, { Component, Fragment } from 'react'

let width, height, hist = [], videoContext, graphContext

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
      started: false,
      torchOn: false,
    }

    this.localStream = null

    this.toggle = this.toggle.bind(this)
    this.close = this.close.bind(this)
    this.start = this.start.bind(this)
    this.draw = this.draw.bind(this)
    this.toggleTorch = this.toggleTorch.bind(this)
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
    const { isInDaChat, getSystemStream, i18n, mbox } = this.props

    const video = {
      facingMode: 'environment',
    }

    window.navigator.mediaDevices.getUserMedia({ video, audio: false }).then(stream => {
      this.setState({started: true}, () => this.init(stream))
    }, () => {
      const stream = getSystemStream()

      if (stream && stream.getVideoTracks().length) {
        this.setState({started: true}, () => this.init(stream))
      } else {
        mbox({text: i18n.t('noCamera')})
      }
    })
  }

  toggleTorch () {

    const torchOn = !this.state.torchOn

    if (this.localStream) {
      const track = this.localStream.getVideoTracks()[0]

      track.applyConstraints({
        advanced: [{torch: torchOn}]
      }).catch(() => null)
    }

    this.setState({torchOn})
  }

  init (stream) {
    this.localStream = stream
    this.video.srcObject = stream
    this.video.play()

    setTimeout(() => {
      // TODO: make sure this.video is not null
      width = this.video.videoWidth
      height = this.video.videoHeight

      videoContext = this.videoCanvas.getContext('2d')
      graphContext = this.graphCanvas.getContext('2d')

      window.requestAnimationFrame(this.draw)
    }, 300)
  }

  draw () {

    if (!this.state.isShown) {
      return
    }

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
      this.bpm.innerHTML = pulseRate.toFixed(0)
    } else {
      this.bpm.innerHTML = '⏳'
    }
  }

  render () {

    const { i18n } = this.props
    const { isShown, started } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui}>
        <div style={styles.box}>
          <video ref={c => this.video = c} height="100" style={{display: 'none'}} muted/>
          <div style={styles.firstRow}>
            {
              started ?
                <Fragment>
                  <canvas ref={c => this.videoCanvas = c} style={styles.videoCanvas} />
                  <div style={styles.bpmBox}>
                    <span ref={c => this.bpm = c} style={styles.bpm}>⏳</span>
                    <span> bpm</span>
                  </div>
                </Fragment>
                :
                <div style={{textAlign: 'center'}}>{ i18n.t('useHint') }</div>
            }

          </div>
          <canvas ref={c => this.graphCanvas = c} width="320" height="30" style={styles.graphCanvas} />

          <div style={styles.buttons}>
            <button onClick={this.start} style={styles.button}>{ i18n.t('btnStart') }</button>
            {
            //  started && <button onClick={this.toggleTorch} style={styles.button}>{ i18n.t('btnTorch') }</button>
            }
            <button onClick={this.close} style={styles.button}>{ i18n.t('btnClose') }</button>
          </div>

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
    height: '100%',
    background: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '360px',
    maxWidth: '100vw',
    padding: '16px',
    background: '#fff',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  firstRow: {
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoCanvas: {
    width: '100px',
    height: '100px',
    filter: 'blur(5px)',
    borderRadius: '100px',
    marginLeft: '50px',
  },
  graphCanvas: {
    margin: '16px 0',
  },
  bpmBox: {
    width: '150px',
  },
  bpm: {
    fontSize: '36px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  button: {
    marginTop: '8px',
  },
}

export default UI
