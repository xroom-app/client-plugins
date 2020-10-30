import 'regenerator-runtime/runtime'
import React from 'react'
import UI from './ui'

function onRoomEnter () {
  this.addIcon()
  this.api('renderControls')
}

function onRoomExit () {
  this.api('removeIcon')
}

function onDataIn (data) {
  const { pluginId, cmd, args } = data

  if (pluginId !== this.id || !cmd) return
  this.ui.dataIn({cmd, args})
}

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

  events: {
    'ss/onJoin': onRoomEnter,
    'room/exit': onRoomExit,
    'data/in': onDataIn,
  },

  register ({roomId}) {
    this.api('appendScript', {src: '/plugins/nisdos/terminal/xterm.js'})
    this.api('appendStyle', {src: '/plugins/nisdos/terminal/xterm.css'})

    this.api('addUI', { component:
      <UI
        i18n={this.i18n}
        api={this.api}
        ref={(ref) => { this.ui = ref} }
      />
    })

    if (roomId) {
      this.addIcon()
    }
  },

  unregister () {
    this.api('removeIcon')
  },

  addIcon () {
    this.api('addIcon', {
      title: this.i18n.t('iconCaption'),
      onClick: () => {
        if (this.ui) {
          this.ui.open()
        }
      },
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d='M20,19V7H4V19H20M20,3A2,2 0 0,1 22,5V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V5C2,3.89 2.9,3 4,3H20M13,17V15H18V17H13M9.58,13L5.57,9H8.4L11.7,12.3C12.09,12.69 12.09,13.33 11.7,13.72L8.42,17H5.59L9.58,13Z' />
        </svg>
    })
  },

  isSupported () {
    return window.screen && window.screen.width > 1000
  }
})
