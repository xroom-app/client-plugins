import 'regenerator-runtime/runtime'
import * as React from 'preact'
import IconSvg from './icon'
import UI from './ui'

function onRoomEnter () {
  this.inDaChat = true
  this.addIcon()
  xroom.api('renderControls')
}

function onRoomExit () {
  this.inDaChat = false
}

function onStreamsChanged () {
  const { local, remote } = xroom.api('getStreams')

  if (local || remote) {
    this.audioCompositeStream = this.composite(local, [local, ...Object.values(remote)])
    console.log('Composition recomputed', !!local, Object.keys(remote).length)
  }
}

xroom.plugin = {
  inDaChat: false,
  mimeType: null,
  countDownStep: 0,
  recordedBlobs: [],
  mediaRecorder: null,
  isRecording: false,
  screenStream: null,

  translations: {
    en: {
      iconCaptionOn: 'Screen rec on',
      iconCaptionOff: 'Screen rec off',
      btnSave: 'Save',
      btnClose: 'Close',
      btnToChat: 'Send to chat',
      warn1: 'Files will disappear if you close the browser.<br>Download them if you need them!',
      warn2: 'Turn on your mic and cam or start screen sharing first',
      recNotify: '📢 I have started recording my screen.',
      recOffNotify: '⏹️ Screen recording stopped.',
    },
    sv: {
      iconCaptionOn: 'Skärminsp. på',
      iconCaptionOff: 'Skärminsp. av',
      btnSave: 'Spara',
      btnClose: 'Stänga',
      btnToChat: 'Skicka till chat',
      warn1: 'Filerna ska försvinna efter du stänger webbläsaren.<br>Ladda dem ner om dem behövs!',
      warn2: 'Starta kameran eller skärmdelningen först',
      recNotify: '📢 Jag har börjat en skärminspelning',
      recOffNotify: '⏹️ Inspelningen slutat.',
    },
    ru: {
      iconCaptionOn: 'Запись экрана вкл.',
      iconCaptionOff: 'Запись экрана выкл.',
      btnSave: 'Сохранить',
      btnClose: 'Закрыть',
      btnToChat: 'Отправить в чат',
      warn1: 'Файлы исчезнут после закрытия окна.<br>Скачайте их, если они нужны!',
      warn2: 'Сначала активируйте камеру или скриншеринг',
      recNotify: '📢 Я начал запись экрана.',
      recOffNotify: '⏹️ Запись экрана завершена.',
    },
  },

  events: {
    'room/ready': onRoomEnter,
    'room/exit': onRoomExit,
    'localStream/changed': onStreamsChanged,
    'peer/trackAdded': onStreamsChanged,
  },

  async register () {
    this.boundCountDown = this.countDown.bind(this)

    if (window.MediaRecorder.isTypeSupported('video/webm')) {
      this.mimeType = 'video/webm'
    }

    await xroom.api('addUI', { component:
      <UI
        ui={xroom.ui}
        i18n={xroom.i18n}
        api={xroom.api}
        ref={(ref) => { this.uiRef = ref} }
      />
    })

    onStreamsChanged.bind(this)()

    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => this.isRecording ? xroom.i18n.t('iconCaptionOn') : xroom.i18n.t('iconCaptionOff'),
      onClick: () => this.isRecording ? this.stopRecording() : this.preStartRecording(),
      svg: props => <IconSvg {...props} on={this.isRecording}/>
    })
  },

  isSupported () {
    return !!window.MediaRecorder && window.MediaRecorder.isTypeSupported && window.MediaRecorder.isTypeSupported('video/webm')
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

  async preStartRecording () {
    const { screenOn, camOn, micOn } = xroom.api('getFlags')

    this.countDownStep = 3
    this.recordedBlobs = []

    if (!this.audioCompositeStream || !micOn || (!screenOn && !camOn)) {
      return xroom.mbox({text: xroom.i18n.t('warn2')})
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.audioCompositeStream, { mimeType: this.mimeType })
    } catch (e) {
      console.error('MediaRecorder:', e)
      return
    }

    this.mediaRecorder.onstop = () => {
      this.uiRef.openWith(new Blob(this.recordedBlobs, { type: this.mimeType }), this.mimeType)
    }

    this.mediaRecorder.ondataavailable = (e) => this.handleDataAvailable(e)

    const iDiv = document.createElement('div')

    iDiv.id = 'screen-recorder-n'
    iDiv.style.cssText = 'top:0;bottom:0;width:100vw;height:100vh;position:fixed;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5)'
    iDiv.innerHTML = `<div style="color:#fff;transition:transform 0.5s;transform:scale(0)"/>`
    document.body.appendChild(iDiv)

    this.countDown()
    xroom.api('sendMessage', {msg: xroom.i18n.t('recNotify'), from: 'self', to: 'all', pvt: false})
  },

  startRecording () {
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
        { screenOn } = xroom.api('getFlags'),
        videoTrack = videoTrackStream.getVideoTracks()[screenOn ? 1 : 0]

      videoTrack && tracks.push(videoTrack)

      if (audioTrackStreams.length) {
        const mixedTracks = dest.stream.getAudioTracks()[0]

        mixedTracks && tracks.push(mixedTracks)
      }

      return new MediaStream(tracks)
    }

    return dest.stream
  }
}
