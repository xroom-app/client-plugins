import React from 'react'
import UI from './ui'

function onRoomRead (data) {
  const oldState = this.isLocked
  this.isLocked = data.access ? data.access.lock : false
  this.password = data.access ? (data.access.password ? Math.random() : null) : null

  if (oldState !== this.isLocked) {
    this.api('renderControls')
    if (this.ui) {
      this.ui.setLock(this.isLocked)
      this.ui.setPassword(this.password)
    } else {
      this.mbox({text: 'Cannot create interface. Do you run an ad blocker?'})
    }
  }
}

function onRoomEnter (data) {
  this.inDaChat = true
  this.isLocked = data.isLocked
  this.addIcon()
}

function onRoomExit () {
  this.inDaChat = false
}

function onRoomLockSet (data) {
  this.isLocked = data
  this.api('renderControls')
  if (this.ui) {
    this.ui.setLock(data)
  }
}

function onPasswordSet (data) {
  this.password = data
  this.api('renderControls')
  this.ui.setPassword(data)
}

function onPasswordReset () {
  this.password = null
  this.api('renderControls')
  this.ui.setPassword(null)
}

const
  lockedString = 'M12,17C10.89,17 10,16.1 10,15C10,13.89 10.89,13 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10C4,8.89 4.89,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z',
  unlockedString = 'M18,20V10H6V20H18M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,1 10,15A2,2 0 0,1 12,13A2,2 0 0,1 14,15A2,2 0 0,1 12,17Z'

XROOM_PLUGIN({

  inDaChat: false,
  isLocked: false,
  password: null,

  events: {
    'ss/onReadRoom': onRoomRead,
    'ss/lockSet': onRoomLockSet,
    'ss/onJoin': onRoomEnter,
    'ss/passwordSet': onPasswordSet,
    'ss/passwordReset': onPasswordReset,
    'room/exit': onRoomExit,
  },

  translations: {
    en: {
      iconCaptionOn: 'Locked',
      iconCaptionOff: 'Open',
      mbox: {
        enterFirst: 'Enter the room first',
        recommendation: 'Installing this plugin in a locked room may cause wrong indication.',
      },
      pwdPlaceholder: 'room password',
      roomOpen: 'Room open',
      roomLocked: 'Room locked',
      roomProtected: 'Room password-protected',
    },
    sv: {
      iconCaptionOn: 'Låst',
      iconCaptionOff: 'Upplåst',
      mbox: {
        enterFirst: 'Gå in i rummet först',
        recommendation: 'Installation av denna plugin i ett låst rum kan orsaka fel indikation.',
      },
      pwdPlaceholder: 'rumslösenord',
      roomOpen: 'Rummet öppna',
      roomLocked: 'Rummet stängda',
      roomProtected: 'Rummet skyddade med ett lösen',
    },
    ru: {
      iconCaptionOn: 'Закрыто',
      iconCaptionOff: 'Открыто',
      mbox: {
        enterFirst: 'Сначала войдите в комнату',
        recommendation: 'Установка плагина сразу внутри закрытой комнаты может привести к неправильной индикации.',
      },
      pwdPlaceholder: 'пароль от комнаты',
      roomOpen: 'Комната открыта',
      roomLocked: 'Комната закрыта',
      roomProtected: 'Комната запаролена',
    },
  },

  register ({roomId}) {
    return this.mbox({html: 'We have moved the lock plugin into the core, please uninstall it.<br/><br/>Lock control is now at "More" → "Locking"'})


    this.addIcon()
    if (roomId) {
      this.inDaChat = true
      this.mbox({text: this.i18n.t('mbox.recommendation')})
    }

    this.api('addUI', { component:
      <UI
        i18n={this.i18n}
        api={this.api}
        ref={(ref) => { this.ui = ref} }
        lockStrings={[unlockedString, lockedString]}
        onLockToggle={() => this.api('setRoomLock', !this.isLocked)}
        onPasswordSet={pwd => this.api('setRoomPassword', pwd)}
      />
    })
  },

  unregister () {
    this.api('removeIcon')
  },

  isSupported () {
    return true
  },

  addIcon () {
    this.api('addIcon', {
      title: () => this.i18n.t(this.isLocked ? 'iconCaptionOn' : 'iconCaptionOff'),
      onClick: () => {
        if (this.inDaChat) {
          this.ui.open()
        } else {
          this.mbox({text: this.i18n.t('mbox.enterFirst')})
        }
      },
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d={(this.isLocked || this.password) ? lockedString : unlockedString} />
        </svg>
    })
  }
})
