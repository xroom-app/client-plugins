import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'
import IconSvg from './icon'

function onRoomEnter () {
  this.inDaChat = true
}

function onRoomExit () {
  this.inDaChat = false
}

async function onStreamsChanged () {
  const { local, remote } = await xroom.api('getStreams')

  if (local || remote) {
    this.audioCompositeStream = this.composite(null, [local, ...Object.values(remote)])
    console.log('Composition recomputed', !!local, Object.keys(remote).length)
  }
}

xroom.plugin = {
  inDaChat: null,
  mimeType: 'audio/webm',
  recordedBlobs: [],
  mediaRecorder: null,
  isRecording: false,
  audioCompositeStream: null,

  translations: {
    en: {
      header: 'Audio recorder',
      iconCaptionOn: 'Sound rec on',
      iconCaptionOff: 'Sound rec off',
      btnStart: 'Start recording',
      btnStop: 'Stop recording',
      files: 'Recently recorded files',
      getIntoRoom: 'To start recording enter this room with a plugin already added.',
      recNotify: '📢 I have started recording audio.',
      recOffNotify: '⏹️ Audio recording stopped.',
    },
    es: {
      header: 'Audio recorder',
      iconCaptionOn: 'Screen rec on',
      iconCaptionOff: 'Screen rec off',
      btnStart: 'Start recording',
      btnStop: 'Stop recording',
      files: 'Recently recorded files',
      getIntoRoom: 'To start recording enter this room with a plugin already added.',
      recNotify: '📢 Empecé a grabar audio.',
      recOffNotify: '⏹️ Se detuvo la grabación de audio.',
    },
    sv: {
      header: 'Ljudinspelning',
      iconCaptionOn: 'Ljudinsp. på',
      iconCaptionOff: 'Ljudinsp. av',
      btnStart: 'Börja inspelningen',
      btnStop: 'Sluta inspelningen',
      files: 'Inspelade filer',
      getIntoRoom: 'För att börja inspelningen, gå in i rummet med plugin:et redan lagt till.',
      recNotify: '📢 Jag har börjat en inspelning',
      recOffNotify: '⏹️ Inspelning avslutad.',
    },
    ru: {
      header: 'Запись аудио',
      iconCaptionOn: 'Запись звука вкл.',
      iconCaptionOff: 'Запись звука выкл.',
      btnStart: 'Начать запись',
      btnStop: 'Закончить запись',
      files: 'Недавно записаные файлы',
      getIntoRoom: 'Для записи зайдите в комнату с уже добавленным плагином.',
      recNotify: '📢 Я начал запись аудио.',
      recOffNotify: '⏹️ Запись аудио завершена.',
    },
  },

  events: {
    'room/ready': onRoomEnter,
    'room/exit': onRoomExit,
    'localStream/changed': onStreamsChanged,
    'peer/trackAdded': onStreamsChanged,
  },

  register () {
    const isSupported = window.MediaRecorder.isTypeSupported

    if (isSupported) {
      if (isSupported('audio/ogg;codecs=opus') && !xroom.device.startsWith('Firefox')) {
        this.mimeType = 'audio/ogg'
      } else if (isSupported('audio/webm;codecs=opus')) {
        this.mimeType = 'audio/webm'
      } else if (isSupported('audio/mp4')) {
        this.mimeType = 'audio/mp4'
      }
    }

    onStreamsChanged.bind(this)()

    xroom.api('addUI', { component:
      <UI
        api={xroom.api}
        ui={xroom.ui}
        i18n={xroom.i18n}
        ref={(ref) => { this.ui = ref} }
        startRec={() => this.startRecording(this.audioCompositeStream)}
        stopRec={() => this.stopRecording()}
      />
    })

    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => {
        return this.isRecording ? xroom.i18n.t('iconCaptionOn') : xroom.i18n.t('iconCaptionOff')
      },
      onClick: () => this.ui.open(),
      svg: props => <IconSvg {...props} on={this.isRecording} />,
    })
  },

  isSupported () {
    return !!window.MediaRecorder
  },

  startRecording (stream) {
    xroom.api('sendMessage', {msg: xroom.i18n.t('recNotify'), from: 'self', to: 'all', pvt: false})

    this.recordedBlobs = []

    let options = { mimeType: this.mimeType }

    if (!stream) {
      return xroom.mbox({text: xroom.i18n.t('getIntoRoom')})
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, options)
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e)
      return
    }

    this.mediaRecorder.onstop = () => {
      this.ui.push(new Blob(this.recordedBlobs, { type: this.mimeType }), this.mimeType)
    }

    this.mediaRecorder.ondataavailable = (e) => this.handleDataAvailable(e)
    this.mediaRecorder.start(1000)
    this.isRecording = true
    xroom.api('renderControls')
  },

  handleDataAvailable (event) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data)
    }
  },

  stopRecording () {
    this.mediaRecorder.stop()
    this.isRecording = false
    xroom.api('renderControls')
    xroom.api('sendMessage', {msg: xroom.i18n.t('recOffNotify'), from: 'self', to: 'all', pvt: false})
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
      const tracks = []

      videoTrackStream.getVideoTracks().forEach(tracks.push)
      dest.stream.getAudioTracks().forEach(tracks.push)

      return new MediaStream(tracks)
    }

    return dest.stream
  }
}
