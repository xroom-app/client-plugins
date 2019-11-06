import React from 'react'
import UI from './ui'

XROOM_PLUGIN({

  calendlyScriptRef: null,

  register () {

    this.api('addIcon', {
      title: 'Calendly',
      onClick: () => this.ui.toggleShow(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 100 100">
          <path fill={props.color || '#000'} d="M6.6 99.3c-2.4-.8-4.5-2.7-5.7-5-.9-1.9-.9-4-.9-42 0-44.8-.2-42 3.5-45.2C6.1 5 8 4.6 16.7 4.5h8V2.7c.3-2 1-2.8 2.4-2.8 1.6 0 2.6 1.2 2.6 3v1.7h40.5l.1-2c.2-1.7.4-2 1.6-2.4 1.9-.7 3 0 3.2 2.3l.3 1.8 8 .1c8.7.1 10.5.5 13 2.6 3.8 3.2 3.6.4 3.6 45.2 0 37.7 0 40.2-.9 42a11 11 0 0 1-6.3 5.2c-1.2.4-15.7.5-43 .5-33.8 0-41.6-.1-43.2-.7zm86.6-5.8l1.5-1.3V12.5L93.2 11l-1.4-1.3H75.1v4.4c0 4.3 0 4.4-1.2 5-1 .4-1.4.3-2.4-.3-1.2-.7-1.2-1-1.2-5V9.8H29.7v4.1c0 4 0 4.3-1.2 5-1 .6-1.5.7-2.4.3-1.2-.6-1.2-.7-1.2-5V9.8h-8.3c-9.3 0-10.3.3-11.2 3.6-.7 2.4-.7 75.5 0 77.9A6 6 0 0 0 7 94c1.3.9 1.7.9 43 .9h41.7zM48.5 69.7a18.1 18.1 0 0 1-11.8-9.6c-1-2-1.2-3.3-1.2-6 0-5 1.3-8.2 4.8-11.6 4.5-4.4 10-6 16.4-4.8 3.4.6 7.7 2.6 7.7 3.5 0 1-.9.8-2.5-.3-3.6-2.4-10.1-3-14.8-1.3a18.7 18.7 0 0 0-9 8c-1 2-1.2 3.2-1.2 6.1 0 4.4 1 7 3.9 10 2.5 2.7 5 4.1 8.6 5 4.7 1.1 7 .7 14.6-3 .2-.1.4.1.4.5s-1 1.3-2 1.9c-4.2 2.3-9.6 3-14 1.6z" />
        </svg>
    })

    this.api('appendScript', {src: 'https://assets.calendly.com/assets/external/widget.js'}).then((id) => {
      this.calendlyScriptRef = id
    })

    this.api('addUI', {
      component: <UI ref={(ref) => { this.ui = ref} }/>
    })
  },

  unregister () {
    this.api('removeIcon')
    this.api('removeElement', this.calendlyScriptRef)
  },

  isSupported () {
    return true
  },
})
