import React from 'react'
import UI from './ui'

async function onStreamsChanged () {
  const { local } = await this.api('getStreams')

  if (local) this.composite(local)
}

XROOM_PLUGIN({

  mimeType: null,

  translations: {
    en: {
      iconCaption: 'Effects',
      mute: 'Mute',
      unmute: 'Unmute',
      placeholder: 'Choose effect',
      distortion: {
        label: 'Distortion',
        gain: 'Gain',
      },
      delay: {
        label: 'Delay',
        time: 'Time',
        feedback: 'Feedback',
        volume: 'Volume',
      },
    },
    sv: {
      iconCaption: 'Effekter',
    },
    ru: {
      iconCaption: 'Эффекты',
      mute: 'Выкл.',
      unmute: 'Вкл.',
      placeholder: 'Выберите эффект',
      distortion: {
        label: 'Искажение',
        gain: 'Уровень',
      },
      delay: {
        label: 'Эхо',
        time: 'Время',
        feedback: 'Обр. связь',
        volume: 'Уровень',
      },
    },
  },

  events: {
    'localStream/changed': onStreamsChanged,
    'peer/trackAdded': onStreamsChanged,
  },

  register () {
    this.ctx = this.audioContext
    onStreamsChanged.bind(this)()

    this.api('addUI', { component:
      <UI
        api={this.api}
        i18n={this.i18n}
        ref={(ref) => { this.ui = ref} }
      />
    })

    this.addIcon()
  },

  unregister () {
    this.api('removeIcon')
  },

  addIcon () {
    this.api('addIcon', {
      title: () => this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggle(this.ctx, this.source),
      svg: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 50 50">
          <path fill="#DDD" d="M7.04 10.21H43c1.06 0 1.89.81 1.89 1.84v25.8c0 1.04-.83 1.85-1.9 1.85H7.05c-1.06 0-1.9-.81-1.9-1.84v-25.8c0-1.04.84-1.85 1.9-1.85zm0-1.84a3.75 3.75 0 0 0-3.79 3.68v25.8c0 2.03 1.7 3.7 3.79 3.7H43a3.75 3.75 0 0 0 3.78-3.7v-25.8c0-2.02-1.7-3.68-3.78-3.68zM6 9h38c1.12 0 2 .88 2 2v28c0 1.12-.88 2-2 2H6c-1.12 0-2-.88-2-2V11c0-1.12.88-2 2-2zm0-2c-2.2 0-4 1.8-4 4v28c0 2.2 1.8 4 4 4h38c2.2 0 4-1.8 4-4V11c0-2.2-1.8-4-4-4z"/>
        </svg>)
    })
  },

  isSupported () {
    return !!(window.AudioContext || window.webkitAudioContext)
  },

  composite (stream = null) {
    this.source = this.ctx.createMediaStreamSource(stream)
  }
})
