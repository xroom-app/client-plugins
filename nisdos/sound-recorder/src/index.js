import React, { Component } from 'react'
import UI from './ui'

/**
 * Advanced rec icon :)
 */
class NisdosSoundRecoderIconSvg extends Component {

  constructor(props) {
    super(props)

    this.timer = null
    this.state = {
      blink: false,
    }

    if (this.props.on) {
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
    if (this.timer) {
      this.stop()
    }

    this.timer = setInterval(() => {
      this.setState({blink: !this.state.blink})
    }, 500)

    this.setState({blink: true})
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.setState({blink: false})
    }
    this.timer = null
  }

  render() {
    let { color, size } = this.props
    const { blink } = this.state

    color = color || '#000'

    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 50 50">
        <path fill={ color } d="M7.04 10.21H43c1.06 0 1.89.81 1.89 1.84v25.8c0 1.04-.83 1.85-1.9 1.85H7.05c-1.06 0-1.9-.81-1.9-1.84v-25.8c0-1.04.84-1.85 1.9-1.85zm0-1.84a3.75 3.75 0 0 0-3.79 3.68v25.8c0 2.03 1.7 3.7 3.79 3.7H43a3.75 3.75 0 0 0 3.78-3.7v-25.8c0-2.02-1.7-3.68-3.78-3.68zM6 9h38c1.12 0 2 .88 2 2v28c0 1.12-.88 2-2 2H6c-1.12 0-2-.88-2-2V11c0-1.12.88-2 2-2zm0-2c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h38c2.2 0 4-1.8 4-4V11c0-2.2-1.8-4-4-4z"/>
        <path fill={ blink ? '#e04006' : color } d="M13 21a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4z"/>
        <path fill={ color } d="M38.4 21.29c-2.12 0-3.42 1.4-3.42 3.7 0 2.3 1.3 3.72 3.41 3.72 1.81 0 3.12-1.13 3.18-2.75h-1.72a1.4 1.4 0 0 1-1.45 1.26c-.99 0-1.59-.85-1.59-2.23 0-1.37.6-2.2 1.58-2.2.77 0 1.35.5 1.45 1.27h1.72c-.05-1.6-1.4-2.77-3.17-2.77z"/>
        <path fill={ color } d="M28.66 21.48v7.04h4.83v-1.44h-3.04v-1.44h2.86v-1.32h-2.86v-1.4h3.04v-1.44z"/>
        <path fill={ color } d="M22.79 22.83h1.06c.64 0 1.05.38 1.05.98 0 .62-.39.98-1.05.98H22.8v-1.96zM21 21.48v7.04h1.8v-2.46h.92l1.2 2.46h2.02l-1.4-2.73a2.1 2.1 0 0 0 1.2-1.99c0-1.45-1-2.32-2.64-2.32z"/>
      </svg>
    )
  }
}

function onRoomEnter () {
  this.inDaChat = true
}

function onRoomExit () {
  this.inDaChat = false
}

async function onStreamsChanged () {
  const { local, remote } = await this.api('getStreams')

  if (local || remote) {
    this.audioCompositeStream = this.composite(null, [local, ...Object.values(remote)])
    console.log('Composition recomputed', !!local, Object.keys(remote).length)
  }
}

XROOM_PLUGIN({

  inDaChat: null,
  mimeType: null,
  recordedBlobs: [],
  mediaRecorder: null,
  isRecording: false,
  audioCompositeStream: null,

  translations: {
    en: {
      iconCaptionOn: 'Rec on',
      iconCaptionOff: 'Rec off',
      btnSave: 'Save',
      btnClose: 'Close',
      warn1: 'Files will disappear if you close the browser.<br>Download them if you need them!',
      getIntoRoom: 'To start recording enter this room with a plugin already added.',
      recNotify: '📢 I have started recording audio.',
    },
    sv: {
      iconCaptionOn: 'Insp. på',
      iconCaptionOff: 'Insp. av',
      btnSave: 'Spara',
      btnClose: 'Stänga',
      warn1: 'Filerna ska försvinna efter du stänger webbläsaren.<br>Ladda dem ner om dem behövs!',
      getIntoRoom: 'För att börja inspelningen, gå in i rummet med plugin:et redan lagt till.',
      recNotify: '📢 Jag har börjat en inspelning',
    },
    ru: {
      iconCaptionOn: 'Запись вкл.',
      iconCaptionOff: 'Запись выкл.',
      btnSave: 'Сохранить',
      btnClose: 'Закрыть',
      warn1: 'Файлы исчезнут после закрытия окна.<br>Скачайте их, если они нужны!',
      getIntoRoom: 'Для записи зайдите в комнату с уже добавленным плагином.',
      recNotify: '📢 Я начал запись аудио.',
    },
  },

  events: {
    'ss/onJoin': onRoomEnter,
    'room/exit': onRoomExit,
    'localStream/changed': onStreamsChanged,
    'peer/trackAdded': onStreamsChanged,
  },

  register () {
    if (window.MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      this.mimeType = 'audio/ogg'
    } else if (window.MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      this.mimeType = 'audio/webm'
    }

    onStreamsChanged.bind(this)()

    this.api('addUI', { component:
      <UI
        i18n={this.i18n}
        ref={(ref) => { this.ui = ref} }
      />
    })

    this.addIcon()
  },

  unregister () {
    this.api('removeIcon')
  },

  addIcon () {
    this.api('addIcon', {
      title: () => {
        return this.isRecording ? this.i18n.t('iconCaptionOn') : this.i18n.t('iconCaptionOff')
      },
      onClick: () => {
        if (this.isRecording) {
          this.stopRecording()
        } else {
          this.startRecording(this.audioCompositeStream)
        }
      },
      svg: props => <NisdosSoundRecoderIconSvg {...props} on={this.isRecording}/>
    })
  },

  isSupported () {
    return !!window.MediaRecorder
  },

  startRecording (stream) {
    this.api('sendMessage', {message: this.i18n.t('recNotify'), to: null})

    this.recordedBlobs = []

    let options = { mimeType: this.mimeType }

    if (!stream) {
      return this.mbox({text: this.i18n.t('getIntoRoom')})
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, options)
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e)
      return
    }

    this.mediaRecorder.onstop = () => {
      this.ui.openWith(new Blob(this.recordedBlobs, { type: this.mimeType }), this.mimeType)
    }

    this.mediaRecorder.ondataavailable = (e) => this.handleDataAvailable(e)
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
