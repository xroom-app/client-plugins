import React from 'react'
import UI from './ui'

const github = 'https://github.com/punarinta/xroom-plugins/tree/master/nisdos/followup'

XROOM_PLUGIN({

  translations: {
    en: {
      iconCaption: 'Follow-up',
      btnGenerate: 'Generate',
      btnDownload: 'Download',
      btnShare: 'Share',
      theDate: 'Date:',
      fromTime: 'From time:',
      toTime: 'To time:',
      summary: 'Event:',
      header: `This is a test plugin. <a href="${github}" target="_blank">Help us to make it better!</a>`,
      getIntoRoom: 'To share the file please enter a room.',
    },
    ru: {
      iconCaption: 'В календарь',
      btnGenerate: 'Создать',
      btnDownload: 'Скачать',
      btnShare: 'Скинуть в чат',
      theDate: 'Дата:',
      fromTime: 'От:',
      toTime: 'До:',
      summary: 'Название:',
      header: `Это тестовый плагин. <a href="${github}" target="_blank">Помогите нам сделать его лучше!</a>`,
      getIntoRoom: 'Чтобы с кем-нибудь поделиться файлом, пожалуйста, войдите в комнату.',
    },
  },

  register ({roomId}) {
    this.onRoomEnter = this.onRoomEnter.bind(this)
    this.onRoomExit = this.onRoomExit.bind(this)

    window.addEventListener('room/enter', this.onRoomEnter)
    window.addEventListener('room/exit', this.onRoomExit)

    this.api('addIcon', {
      title: this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggleShow(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M15,13H16.5V15.82L18.94,17.23L18.19,18.53L15,16.69V13M19,8H5V19H9.67C9.24,18.09 9,17.07 9,16A7,7 0 0,1 16,9C17.07,9 18.09,9.24 19,9.67V8M5,21C3.89,21 3,20.1 3,19V5C3,3.89 3.89,3 5,3H6V1H8V3H16V1H18V3H19A2,2 0 0,1 21,5V11.1C22.24,12.36 23,14.09 23,16A7,7 0 0,1 16,23C14.09,23 12.36,22.24 11.1,21H5M16,11.15A4.85,4.85 0 0,0 11.15,16C11.15,18.68 13.32,20.85 16,20.85A4.85,4.85 0 0,0 20.85,16C20.85,13.32 18.68,11.15 16,11.15Z" />
        </svg>
    })

    this.api('addUI', {
      component: <UI
        api={this.api}
        mbox={this.mbox}
        i18n={this.i18n}
        roomId={roomId}
        ref={(ref) => { this.ui = ref} }
      />
    })
  },

  unregister () {
    this.api('removeIcon')
    window.removeEventListener('room/enter', this.onRoomEnter)
    window.removeEventListener('room/exit', this.onRoomExit)
  },

  isSupported () {
    return !!window.Intl
  },

  onRoomEnter () {
    this.ui.onRoomEnter()
  },

  onRoomExit () {
    this.ui.onRoomExit()
  },
})
