import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

function onRoomEnter () {
  this.inDaChat = true
}

function onRoomExit () {
  this.inDaChat = false
}

function onStreamChanged () {
  const ls = xroom.api('getStreams').local

  if (ls) {
    this.videoStream = new MediaStream(ls.getVideoTracks())
  }
}

xroom.plugin = {
  uiRef: null,
  inDaChat: false,
  scriptRef: null,
  videoStream: null,

  translations: {
    en: {
      iconCaption: 'Pulse',
      useHint: 'Press "start" and put your finger on the camera. Make sure you are in a well lit environment.',
      btnStart: 'Start',
      btnClose: 'Close',
      btnTorch: 'Torch',
      noCamera: 'It looks like all the cameras are blocked',
      cameraFallback: 'No rear camera found. Falling back to the front camera.',
    },
    sv: {
      iconCaption: 'Puls',
      useHint: 'Tryck på "starta" och lägg ett finger på kameran. Se till att du befinner dig i en väl upplyst omgivning.',
      btnStart: 'Starta',
      btnClose: 'Stäng',
      btnTorch: 'Lampa',
      noCamera: 'Det känns som ingen kamera är tillgänglig',
      cameraFallback: 'No rear camera found. Falling back to the front camera.',
    },
    ru: {
      iconCaption: 'Пульс',
      useHint: 'Нажмите "начать" и слегка прижмите палец к камере',
      btnStart: 'Начать',
      btnClose: 'Закрыть',
      btnTorch: 'Свет',
      noCamera: 'Похоже, ни одна камера не доступна.',
      cameraFallback: 'No rear camera found. Falling back to the front camera.',
    },
  },

  events: {
    'room/ready': onRoomEnter,
    'room/exit': onRoomExit,
    'localStream/changed': onStreamChanged,
  },

  register () {
    xroom.api('appendScript', {src: 'https://webrtchacks.github.io/adapter/adapter-latest.js'}).then(id => {
      const sysStream = xroom.api('getStreams').local

      if (!this.videoStream && sysStream) {
        this.videoStream = new MediaStream(sysStream.getVideoTracks())
      }

      this.scriptRef = id

      xroom.api('addUI', { component:
        <UI
          ui={xroom.ui}
          i18n={xroom.i18n}
          mbox={xroom.mbox}
          ref={(ref) => { this.uiRef = ref} }
          inDaChat={() => this.inDaChat}
          getSystemStream={() => this.videoStream}
        />
      })

      this.addIcon()
    })
  },

  unregister () {
    xroom.api('removeIcon')
    xroom.api('removeElement', this.scriptRef)
  },

  isSupported () {
    return window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => this.uiRef.toggle(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M4 16h5l2-3 4 6 2-3h3" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
          <path stroke={props.color} d="M3.5 12v-.5A6.5 6.5 0 0116 9h0a6.5 6.5 0 0112.5 2.5C28.5 20 16 27 16 27s-5-2.8-8.7-7" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
        </svg>
     })
  }
}
