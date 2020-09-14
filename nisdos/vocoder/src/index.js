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
      pitch: {
        label: 'Pitch',
        pitch: 'Pitch',
      },
      background: {
        label: 'Background',
        background: 'Background',
        volume: 'Volume',
        file: 'File',
        start: 'Start',
        stop: 'Stop',
        pause: 'Pause',
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
      pitch: {
        label: 'Pitch',
        pitch: 'Pitch',
      },
      background: {
        label: 'Фоновая музыка',
        background: 'Фоновая музыка',
        volume: 'Громкость',
        file: 'файл',
        start: 'Старт',
        stop: 'Стоп',
        pause: 'Пауза',
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
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
          <path fill="#DDD" d="M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z"/>
        </svg>)
    })
  },

  isSupported () {
    return !!(window.AudioContext || window.webkitAudioContext)
  },

  composite (stream = null) {
    this.source = this.ctx.createMediaStreamSource(stream)
    this.source.connect(this.ctx.destination)
  }
})
