import React from 'react'
import UI from './ui'

XROOM_PLUGIN({

  translations: {
    en: {
      iconCaption: 'Flip a coin',
      hint: 'Click on the coin to flip',
    },
    sv: {
      iconCaption: 'Singla slant',
      hint: 'Klicka på slanten för att singla den',
    },
    ru: {
      iconCaption: 'Монетка',
      hint: 'Кликни, чтобы подбросить монетку',
    },
  },

  register () {

    this.api('addIcon', {
      title: this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggleShow(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,17V16H9V14H13V13H10A1,1 0 0,1 9,12V9A1,1 0 0,1 10,8H11V7H13V8H15V10H11V11H14A1,1 0 0,1 15,12V15A1,1 0 0,1 14,16H13V17H11Z" />
        </svg>
    })

    this.api('addUI', { component:
      <UI
        i18n={this.i18n}
        ref={(ref) => { this.ui = ref} }
      />
    })
  },

  unregister () {
    this.api('removeIcon')
  },

  isSupported () {
    return true
  },
})
