import * as React from 'preact'

let width, height, hist = [], videoContext, graphContext

class UI extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
      started: false,
      torchOn: false,
      torchSupported: false,
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
    if (this.localStream){
      this.localStream.getVideoTracks().forEach(t => t.stop())
    }
  }

  async start () {
    const video = {}
    const { getSystemStream, i18n, mbox } = this.props
    const mediaDeviceInfos = (await navigator.mediaDevices.enumerateDevices()).filter(mediaDeviceInfo => mediaDeviceInfo.kind === 'videoinput' && mediaDeviceInfo.label.includes('back'))

    if (mediaDeviceInfos.length) {
      // await mbox({text: mediaDeviceInfos[0].label})
      video.deviceId = mediaDeviceInfos[0].deviceId
    } else {
      video.facingMode = 'environment'
    }

    navigator.mediaDevices.getUserMedia({video}).then(stream => {
      this.setState({started: true}, () => this.init(stream))
    }, async (err) => {
      await mbox({text: `${i18n.t('cameraFallback')} (${err.name})`})
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

      track && track.applyConstraints({
        advanced: [{torch: torchOn}]
      }).catch(() => null)
    }

    this.setState({torchOn})
  }

  async init (stream) {
    // check if torch is supported

    if (stream && typeof window.ImageCapture !== 'undefined') {
      const track = stream.getVideoTracks()[0]
      const imageCapture = new ImageCapture(track)
      const photoCapabilities = await imageCapture.getPhotoCapabilities()

      // this.props.mbox({text: 'Caps: ' + JSON.stringify(track.getCapabilities())})

      if (photoCapabilities) {
        // this.setState({torchSupported: photoCapabilities.fillLightMode && photoCapabilities.fillLightMode.includes('flash')})
        // this.setState({torchSupported: true})
      }
    }

    this.localStream = stream
    this.video.srcObject = stream
    this.video.play()

    videoContext = this.videoCanvas.getContext('2d')
    graphContext = this.graphCanvas.getContext('2d')

    setTimeout(() => {
      if (this.video) {
        width = this.video.videoWidth
        height = this.video.videoHeight
        window.requestAnimationFrame(this.draw)
      }
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
    const { i18n, ui } = this.props
    const { isShown, started, torchSupported } = this.state
    const { Dialog, Button } = ui

    return (
      <Dialog opened={isShown}>
        <video
          autoPlay
          playsInline
          ref={c => this.video = c}
          height="100"
          style={{position: 'fixed', zIndex: -1}}
          muted
        />
        <div style={styles.firstRow}>
          {
            started ?
              <>
                <canvas ref={c => this.videoCanvas = c} style={styles.videoCanvas} />
                <div style={styles.bpmBox}>
                  <span ref={c => this.bpm = c} style={styles.bpm}>⏳</span>
                  <span> bpm</span>
                </div>
              </>
              :
              <div style={{textAlign: 'center'}}>{ i18n.t('useHint') }</div>
          }

        </div>
        <canvas ref={c => this.graphCanvas = c} width="320" height="30" style={styles.graphCanvas} />

        <div style={styles.buttons}>
          <Button primary onClick={this.start}>{ i18n.t('btnStart') }</Button>
          {
            started && torchSupported && <Button secondary onClick={this.toggleTorch}>{ i18n.t('btnTorch') + ` ${this.state.torchOn ? '+' : '-'}` }</Button>
          }
          <Button secondary onClick={this.close}>{ i18n.t('btnClose') }</Button>
        </div>
      </Dialog>
    )
  }
}

const styles = {
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
}

export default UI
