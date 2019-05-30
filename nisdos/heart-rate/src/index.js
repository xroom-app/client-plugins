import React from 'react'
import UI from './ui'

XROOM_PLUGIN({

  inDaChat: false,

  translations: {
    en: {
      iconCaption: 'Pulse',
    },
    sv: {
      iconCaption: 'Puls',
    },
    ru: {
      iconCaption: 'Пульс',
    },
  },

  register () {
    this.onRoomEnter = this.onRoomEnter.bind(this)
    this.onRoomExit = this.onRoomExit.bind(this)
    this.onStreamsChanged = this.onStreamsChanged.bind(this)
    window.addEventListener('room/enter', this.onRoomEnter)
    window.addEventListener('room/exit', this.onRoomExit)
    window.addEventListener('streams/changed', this.onStreamsChanged)
    this.addIcon()

    this.api('addUI', { component:
      <UI
        i18n={this.i18n}
        ref={(ref) => { this.ui = ref} }
      />
    })
  },

  unregister () {
    window.removeEventListener('room/enter', this.onRoomEnter)
    window.removeEventListener('room/exit', this.onRoomExit)
    window.removeEventListener('streams/changed', this.onStreamsChanged)
    this.api('removeIcon')
  },

  isSupported () {
    return window.navigator.mediaDevices && window.navigator.mediaDevices.getUserMedia
  },

  addIcon () {
    this.api('addIcon', {
      title: () => this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggle(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M7.5,4A5.5,5.5 0 0,0 2,9.5C2,10 2.09,10.5 2.22,11H6.3L7.57,7.63C7.87,6.83 9.05,6.75 9.43,7.63L11.5,13L12.09,11.58C12.22,11.25 12.57,11 13,11H21.78C21.91,10.5 22,10 22,9.5A5.5,5.5 0 0,0 16.5,4C14.64,4 13,4.93 12,6.34C11,4.93 9.36,4 7.5,4V4M3,12.5A1,1 0 0,0 2,13.5A1,1 0 0,0 3,14.5H5.44L11,20C12,20.9 12,20.9 13,20L18.56,14.5H21A1,1 0 0,0 22,13.5A1,1 0 0,0 21,12.5H13.4L12.47,14.8C12.07,15.81 10.92,15.67 10.55,14.83L8.5,9.5L7.54,11.83C7.39,12.21 7.05,12.5 6.6,12.5H3Z" />
        </svg>
    })
  },

  onRoomEnter () {
    this.inDaChat = true
  },

  onRoomExit () {
    this.inDaChat = false
  },

  onStreamsChanged (event) {
    this.videoStream = event.detail.cameraStream

    console.log('qqq', this.videoStream)
  }
})
