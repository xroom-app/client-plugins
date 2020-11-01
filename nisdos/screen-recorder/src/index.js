import 'regenerator-runtime/runtime'
import React, { Component } from 'react'
import UI from './ui'

class NisdosScreenRecorderIconSvg extends Component {

  constructor(props) {
    super(props)

    this.timer = null
    this.state = {
      blink: false,
    }

    if (props.on) {
      this.start()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.on) {
      this.start()
    } else {
      this.stop()
    }
  }

  start() {
    this.stop()

    this.timer = setInterval(() => {
      this.setState({blink: !this.state.blink})
    }, 500)

    this.setState({blink: true})
  }

  stop() {
    clearInterval(this.timer)
    this.setState({blink: false})
  }

  render() {
    let { color, size } = this.props
    const { blink } = this.state

    color = color || '#000'

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 50 50">
        <path fill={ blink ? '#e04006' : color } d="M13 21a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z"/>
        <path fill={ color } d="M38.4 21.29c-2.12 0-3.42 1.4-3.42 3.7 0 2.3 1.3 3.72 3.41 3.72 1.81 0 3.12-1.13 3.18-2.75h-1.72a1.4 1.4 0 0 1-1.45 1.26c-.99 0-1.59-.85-1.59-2.23 0-1.37.6-2.2 1.58-2.2.77 0 1.35.5 1.45 1.27h1.72c-.05-1.6-1.4-2.77-3.17-2.77z"/>
        <path fill={ color } d="M28.66 21.48v7.04h4.83v-1.44h-3.04v-1.44h2.86v-1.32h-2.86v-1.4h3.04v-1.44z"/>
        <path fill={ color } d="M22.79 22.83h1.06c.64 0 1.05.38 1.05.98 0 .62-.39.98-1.05.98H22.8v-1.96zM21 21.48v7.04h1.8v-2.46h.92l1.2 2.46h2.02l-1.4-2.73a2.1 2.1 0 0 0 1.2-1.99c0-1.45-1-2.32-2.64-2.32z"/>
        <path fill={ color } d="M15.57 9.69h-.98v1.17l1.08.03 1.15-.2-.04-1.02M36.12 40.3l.04-1.18-1.57-.07-1.61.03.05 1.28 1.63-.03m9.13-3.02H6.3v-25h37.5m0-4.16H6.3a4.15 4.15 0 00-4.16 4.17v25c0 2.3 1.87 4.16 4.17 4.16h14.58v4.17h-4.17v4.16h16.67v-4.16H29.2v-4.17H43.8c2.3 0 4.17-1.86 4.17-4.17v-25a4.16 4.16 0 00-4.17-4.16"/>
      </svg>
    )
  }
}

function onRoomEnter () {
  this.inDaChat = true
  this.addIcon()
  this.api('renderControls')
}

function onRoomExit () {
  this.inDaChat = false
}

async function onStreamsChanged () {
  const { local, remote } = await this.api('getStreams')

  if (local || remote) {
    this.audioCompositeStream = this.composite(local, [local, ...Object.values(remote)])
    console.log('Composition recomputed', !!local, Object.keys(remote).length)
  }
}

XROOM_PLUGIN({

  inDaChat: false,
  mimeType: null,
  countDownStep: 0,
  recordedBlobs: [],
  mediaRecorder: null,
  isRecording: false,
  screenStream: null,

  translations: {
    en: {
      iconCaptionOn: 'Rec on',
      iconCaptionOff: 'Rec off',
      btnSave: 'Save',
      btnClose: 'Close',
      btnToChat: 'Send to chat',
      warn1: 'Files will disappear if you close the browser.<br>Download them if you need them!',
      warn2: 'Turn on the camera or start screen sharing first',
      recNotify: '📢 I have started recording video.',
    },
    sv: {
      iconCaptionOn: 'Insp. på',
      iconCaptionOff: 'Insp. av',
      btnSave: 'Spara',
      btnClose: 'Stänga',
      btnToChat: 'Skicka till chat',
      warn1: 'Filerna ska försvinna efter du stänger webbläsaren.<br>Ladda dem ner om dem behövs!',
      warn2: 'Starta kameran eller skärmdelningen först',
      recNotify: '📢 Jag har börjat en inspelning',
    },
    ru: {
      iconCaptionOn: 'Запись вкл.',
      iconCaptionOff: 'Запись выкл.',
      btnSave: 'Сохранить',
      btnClose: 'Закрыть',
      btnToChat: 'Отправить в чат',
      warn1: 'Файлы исчезнут после закрытия окна.<br>Скачайте их, если они нужны!',
      warn2: 'Сначала активируйте камеру или скриншеринг',
      recNotify: '📢 Я начал запись видео.',
    },
  },

  events: {
    'ss/onJoin': onRoomEnter,
    'room/exit': onRoomExit,
    'localStream/changed': onStreamsChanged,
    'peer/trackAdded': onStreamsChanged,
  },

  async register ({roomId}) {
    this.boundCountDown = this.countDown.bind(this)

    if (window.MediaRecorder.isTypeSupported('video/webm')) {
      this.mimeType = 'video/webm'
    }

    await this.api('addUI', { component:
      <UI
        ui={this.uiLibrary}
        i18n={this.i18n}
        api={this.api}
        ref={(ref) => { this.ui = ref} }
      />
    })

    onStreamsChanged.bind(this)()

    this.addIcon()
  },

  unregister () {
    this.api('removeIcon')
  },

  addIcon () {
    this.api('addIcon', {
      title: () => this.isRecording ? this.i18n.t('iconCaptionOn') : this.i18n.t('iconCaptionOff'),
      onClick: () => this.isRecording ? this.stopRecording() : this.preStartRecording(),
      svg: props => <NisdosScreenRecorderIconSvg {...props} on={this.isRecording}/>
    })
  },

  isSupported () {
    return !!window.MediaRecorder && window.MediaRecorder.isTypeSupported('video/webm')
  },

  countDown () {
    const theDiv = document.querySelector('#screen-recorder-n > div')

    if (--this.countDownStep < 0) {
      document.body.removeChild(document.getElementById('screen-recorder-n'))
      this.startRecording()
    } else {
      // play animation
      setTimeout(function (arg, theDiv) {
        theDiv.innerHTML = arg
        theDiv.style.transform = 'scale(10)'
      }, 16, `${this.countDownStep + 1}`, theDiv)

      setTimeout(function (theDiv) {
        theDiv.style.transform = 'scale(0)'
      }, 500, theDiv)

      setTimeout(this.boundCountDown, 1000)
    }
  },

  preStartRecording () {
    this.countDownStep = 3
    this.recordedBlobs = []

    if (!this.audioCompositeStream) {
      return this.mbox({text: this.i18n.t('warn2')})
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.audioCompositeStream, { mimeType: this.mimeType })
    } catch (e) {
      console.error('MediaRecorder:', e)
      return
    }

    this.mediaRecorder.onstop = () => {
      this.ui.openWith(new Blob(this.recordedBlobs, { type: this.mimeType }), this.mimeType)
    }

    this.mediaRecorder.ondataavailable = (e) => this.handleDataAvailable(e)

    const iDiv = document.createElement('div')

    iDiv.id = 'screen-recorder-n'
    iDiv.style.cssText = 'top:0;bottom:0;width:100vw;height:100vh;position:fixed;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5)'
    iDiv.innerHTML = `<div style="color:#fff;transition:transform 0.5s;transform:scale(0)"/>`
    document.body.appendChild(iDiv)

    this.countDown()
    this.api('sendMessage', {message: this.i18n.t('recNotify'), to: null})
  },

  startRecording () {
    this.mediaRecorder.start(1000)
    this.isRecording = true
    this.api('renderControls')
  },

  handleDataAvailable (event) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data)
    }
  },

  stopRecording () {
    this.mediaRecorder.stop()
    this.isRecording = false
    this.api('renderControls')
  },

  composite (videoTrackStream = null, audioTrackStreams = []) {

    const
      ctx = new AudioContext(),
      dest = ctx.createMediaStreamDestination()

    audioTrackStreams.map(stream => {
      if (stream && stream.getAudioTracks().length) {
        ctx.createMediaStreamSource(stream).connect(dest)
      }
    })

    if (videoTrackStream) {
      const
        tracks = [],
        videoTrack = videoTrackStream.getVideoTracks()[0],
        mixedTracks = dest.stream.getAudioTracks()[0]

      videoTrack && tracks.push(videoTrack)
      mixedTracks && tracks.push(mixedTracks)

      return new MediaStream(tracks)
    }

    return dest.stream
  }
})
