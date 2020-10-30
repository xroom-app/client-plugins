import React from 'react'
import UI from './ui'

function onRoomEnter (data) {
  const roomId = data.roomId.indexOf('xroom.app/') ? data.roomId : data.roomId.replace('xroom.app/', '')

  this.storage.stats[roomId] = (this.storage.stats[roomId] || 0) + 1

  localStorage.setItem('nisdos/phonebook', JSON.stringify(this.storage))
  if (this.ui) {
    this.ui.sync(this.storage)
  }
}

XROOM_PLUGIN({
  storage: null,
  isShown: false,

  translations: {
    en: {
      iconCaption: 'History',
    },
    sv: {
      iconCaption: 'Historik',
    },
    ru: {
      iconCaption: 'История',
    },
  },

  events: {
    'ss/onJoin': onRoomEnter,
  },

  isSupported () {
    return !!window.localStorage
  },

  async register () {
    const stg = localStorage.getItem('nisdos/phonebook') || null

    this.storage = stg ? JSON.parse(stg) : { stats: {[document.location.pathname.split('/')[1]]: 0} }

    await this.api('addUI', { component:
      <UI
        api={this.api}
        storage={this.storage}
        ref={(ref) => { this.ui = ref } }
      />
    })

    this.api('addIcon', {
      title: this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggle(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M17,4V10L15,8L13,10V4H9V20H19V4H17M3,7V5H5V4C5,2.89 5.9,2 7,2H19C20.05,2 21,2.95 21,4V20C21,21.05 20.05,22 19,22H7C5.95,22 5,21.05 5,20V19H3V17H5V13H3V11H5V7H3M5,5V7H7V5H5M5,19H7V17H5V19M5,13H7V11H5V13Z" />
        </svg>
    })
  },

  unregister () {
    this.api('removeIcon')
  }
})
