import React from 'react'
import UI from './ui'

XROOM_PLUGIN({

  translations: {
    en: {
      iconCaption: 'Terminal',
      btnClose: 'Close',
    },
    sv: {
      iconCaption: 'Terminal',
      btnClose: 'Close',
    },
    ru: {
      iconCaption: 'Terminal',
      btnClose: 'Close',
    },
  },

  register () {
    this.onRoomEnter = this.onRoomEnter.bind(this)
    this.onRoomExit = this.onRoomExit.bind(this)
    this.onDataIn = this.onDataIn.bind(this)

    window.addEventListener('room/enter', this.onRoomEnter)
    window.addEventListener('room/exit', this.onRoomExit)
    window.addEventListener('data/in', this.onDataIn)

    this.api('appendScript', {src: '/plugins/nisdos/terminal/xterm.js'})
    this.api('appendStyle', {src: '/plugins/nisdos/terminal/xterm.css'})

    this.api('addUI', { component:
      <UI
        i18n={this.i18n}
        api={this.api}
        ref={(ref) => { this.ui = ref} }
      />
    })
  },

  unregister () {
    window.removeEventListener('room/enter', this.onRoomEnter)
    window.removeEventListener('room/exit', this.onRoomExit)
    window.removeEventListener('data/in', this.onDataIn)
    this.api('removeIcon')
  },

  addIcon () {
    this.api('addIcon', {
      title: this.i18n.t('iconCaption'),
      onClick: () => this.ui.open(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d='M20,19V7H4V19H20M20,3A2,2 0 0,1 22,5V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V5C2,3.89 2.9,3 4,3H20M13,17V15H18V17H13M9.58,13L5.57,9H8.4L11.7,12.3C12.09,12.69 12.09,13.33 11.7,13.72L8.42,17H5.59L9.58,13Z' />
        </svg>
    })
  },

  isSupported () {
    return window.screen && window.screen.width > 1000
  },

  onRoomEnter () {
    this.addIcon()
    this.api('renderControls')
  },

  onRoomExit () {
    this.api('removeIcon')
  },

  onDataIn (event) {
    const { pluginId, cmd, args } = event.detail

    if (pluginId !== this.id || !cmd) return
    this.ui.dataIn({cmd, args})
  }
})
