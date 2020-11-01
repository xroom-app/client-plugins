import 'regenerator-runtime/runtime'
import React from 'react'
import UI from './ui'
import IconSvg from './icon'

function onRoomEnter () {
  this.addIcon()
}

function onRoomExit () {
  this.api('removeIcon')
}

XROOM_PLUGIN({
  inDaChat: false,

  events: {
    'ss/onJoin': onRoomEnter,
    'room/exit': onRoomExit,
  },

  register ({roomId}) {
    if (roomId) {
      this.addIcon()
    }

    this.api('addUI', {
      component: <UI
        ui={this.uiLibrary}
        api={this.api}
        mbox={this.mbox}
        ref={(ref) => { this.ui = ref} }
      />
    })
  },

  addIcon () {
    this.api('addIcon', {
      title: 'Forms',
      onClick: () => this.ui.toggleShow(),
      svg: IconSvg,
    })
  },

  unregister () {
    this.api('removeIcon')
  },

  isSupported () {
    return true
  },
})
