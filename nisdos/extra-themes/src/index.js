import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

import th01 from './themes/01_star_wars_01.json'
import th02 from './themes/02_mountain_01.json'
import th03 from './themes/03_space_01.json'
import th04 from './themes/04_batman_01.json'

xroom.plugin = {
  uiRef: null,

  translations: {
    en: {
      iconCaption: 'More themes',
    },
  },

  async register () {
    xroom.api('addUI', {
      component: <UI
        pluginId={xroom.id}
        ui={xroom.ui}
        api={xroom.api}
        mbox={xroom.mbox}
        i18n={xroom.i18n}
        ref={(ref) => { this.uiRef = ref} }
        themes={[th01, th02, th03, th04]}
      />
    })

    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')
  },

  isSupported () {
    return true
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => this.uiRef.toggle(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M9 4h17a1 1 0 011 1v13a1 1 0 01-1 1H6a1 1 0 01-1-1V8a4 4 0 014-4v0zM14 19l-1 7a3 3 0 006 0l-1-7M5 14h22M21 4v5" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    })
  }
}
