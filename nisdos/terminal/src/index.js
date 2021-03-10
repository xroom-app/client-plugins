import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

function onRoomEnter () {
  this.addIcon()
  xroom.api('renderControls')
}

function onRoomExit () {
  xroom.api('removeIcon')
}

function onDataIn (data) {
  const { pluginId, cmd, args } = data

  if (pluginId !== xroom.id || !cmd) return
  this.uiRef.dataIn({cmd, args})
}

xroom.plugin = {
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
    'room/ready': onRoomEnter,
    'room/exit': onRoomExit,
    'data/in': onDataIn,
  },

  register ({roomId}) {
    xroom.api('appendScript', {src: '/plugins/nisdos/terminal/xterm.js'})
    xroom.api('appendStyle', {src: '/plugins/nisdos/terminal/xterm.css'})

    xroom.api('addUI', { component:
      <UI
        i18n={xroom.i18n}
        api={xroom.api}
        ref={(ref) => { this.uiRef = ref} }
      />
    })

    if (roomId) {
      this.addIcon()
    }
  },

  unregister () {
    xroom.api('removeIcon')
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => {
        if (this.uiRef) {
          this.uiRef.toggle()
        }
      },
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M5 8l9 8-9 8M15 24h12" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    })
  },

  isSupported () {
    return window.screen && window.screen.width > 1000
  }
}
