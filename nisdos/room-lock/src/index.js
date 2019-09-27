import React from 'react'

XROOM_PLUGIN({

  inDaChat: false,
  isLocked: false,

  translations: {
    en: {
      iconCaptionOn: 'Locked',
      iconCaptionOff: 'Open',
    },
    sv: {
      iconCaptionOn: 'Låst',
      iconCaptionOff: 'Upplåst',
    },
    ru: {
      iconCaptionOn: 'Закрыто',
      iconCaptionOff: 'Открыто',
    },
  },

  register () {
    this.onRoomEnter = this.onRoomEnter.bind(this)
    this.onRoomExit = this.onRoomExit.bind(this)
    this.onRoomLockSet = this.onRoomLockSet.bind(this)
    window.addEventListener('room/enter', this.onRoomEnter)
    window.addEventListener('room/exit', this.onRoomExit)
    window.addEventListener('room/lock-set', this.onRoomLockSet)

    this.addIcon()
  },

  unregister () {
    window.removeEventListener('room/enter', this.onRoomEnter)
    window.removeEventListener('room/exit', this.onRoomExit)
    window.removeEventListener('room/lock-set', this.onRoomLockSet)
    this.api('removeIcon')
  },

  isSupported () {
    return true
  },

  addIcon () {
    const
      lockedString = 'M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10C4,8.89 4.89,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z',
      unlockedString = 'M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17Z'

    this.api('addIcon', {
      title: () => this.i18n.t(this.isLocked ? 'iconCaptionOn' : 'iconCaptionOff'),
      onClick: () => this.toggleLock(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d={this.isLocked ? lockedString : unlockedString} />
        </svg>
    })
  },

  toggleLock () {
    this.isLocked = !this.isLocked
    this.api('setRoomLock', this.isLocked)
    this.api('renderControls')
  },

  onRoomEnter () {
    this.inDaChat = true
    this.addIcon()
  },

  onRoomExit () {
    this.inDaChat = false
    this.api('removeIcon')
  },

  onRoomLockSet (event) {
    const { lock } = event.detail

    this.isLocked = lock
    this.api('renderControls')
  },
})
