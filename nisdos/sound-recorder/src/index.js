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
      iconCaptionOn: 'Sound rec on',
      iconCaptionOff: 'Sound rec off',
      btnSave: 'Save',
      btnClose: 'Close',
      btnToChat: 'Send to chat',
      warn1: 'Files will disappear if you close the browser.<br>Download them if you need them!',
      getIntoRoom: 'To start recording enter this room with a plugin already added.',
      recNotify: '📢 I have started recording audio.',
      recOffNotify: '⏹️ Audio recording stopped.',
    },
    sv: {
      iconCaptionOn: 'Ljudinsp. på',
      iconCaptionOff: 'Ljudinsp. av',
      btnSave: 'Spara',
      btnClose: 'Stäng',
      btnToChat: 'Skicka till chat',
      warn1: 'Filerna ska försvinna efter du stänger webbläsaren.<br>Ladda dem ner om dem behövs!',
      getIntoRoom: 'För att börja inspelningen, gå in i rummet med plugin:et redan lagt till.',
      recNotify: '📢 Jag har börjat en inspelning',
      recOffNotify: '⏹️ Inspelningen slutat.',
    },
    ru: {
      iconCaptionOn: 'Запись звука вкл.',
      iconCaptionOff: 'Запись звука выкл.',
      btnSave: 'Сохранить',
      btnClose: 'Закрыть',
      btnToChat: 'Отправить в чат',
      warn1: 'Файлы исчезнут после закрытия окна.<br>Скачайте их, если они нужны!',
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
      if (isSupported('audio/ogg;codecs=opus')) {
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
      onClick: () => {
        if (this.isRecording) {
          this.stopRecording()
        } else {
          this.startRecording(this.audioCompositeStream)
        }
      },
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
      this.ui.openWith(new Blob(this.recordedBlobs, { type: this.mimeType }), this.mimeType)
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
}
