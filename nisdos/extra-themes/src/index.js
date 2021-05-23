import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

xroom.plugin = {
  uiRef: null,

  translations: {
    en: {
    },
  },

  async register () {
    xroom.api('addUI', {
      component: <UI
        ui={xroom.ui}
        api={xroom.api}
        mbox={xroom.mbox}
        i18n={xroom.i18n}
        ref={(ref) => { this.uiRef = ref} }
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
      onClick: () => this.uiRef.toggleShow(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M26 5H6a1 1 0 00-1 1v20c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1z" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
          <path stroke={props.color} d="M27 20l-5.3-5.3a1 1 0 00-1.4 0l-5.6 5.6a1 1 0 01-1.4 0l-2.6-2.6a1 1 0 00-1.4 0L5 22" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
          <path stroke={props.color} d="M12.5 13a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    })
  }
}
