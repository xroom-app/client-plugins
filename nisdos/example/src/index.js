import React from 'react'

XROOM_PLUGIN({

  inDaChat: null,

  register() {
    this.onRoomEnter = this.onRoomEnter.bind(this)
    this.onRoomExit = this.onRoomExit.bind(this)

    window.addEventListener('room/enter', this.onRoomEnter)
    window.addEventListener('room/exit', this.onRoomExit)

    this.api('addIcon', {
      title: () => {
        return 'Example: ' + (this.inDaChat ? 'in' : 'out')
      },
      onClick: () => {
        if (this.inDaChat) {
          alert(`Example plugin says: you are in "${this.inDaChat}"`)
        } else {
          alert('Example plugin says: you are not in the room.')
        }
      },
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill="none" d="M24 24H0V0h24v24z"/>
          <path fill={props.color || '#000'} d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66-.23-.45-.52-.86-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84C7 18.95 8.05 20 9.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z"/>
        </svg>
    })
  },

  unregister() {
    window.removeEventListener('room/enter', this.onRoomEnter)
    window.removeEventListener('room/exit', this.onRoomExit)

    this.api('removeIcon')
  },

  isSupported() {
    return true
  },

  onRoomEnter(event) {
    this.inDaChat = event.detail.roomId
    this.api('renderControls')
  },

  onRoomExit() {
    this.inDaChat = null
  },
})
