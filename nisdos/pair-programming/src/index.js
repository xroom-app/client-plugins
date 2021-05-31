import 'regenerator-runtime/runtime'
import * as React from 'preact'
import UI from './ui'

let TheRange = null

function onRoomEnter () {
  this.inDaChat = true
  xroom.api('renderControls')
}

function onRoomExit () {
  this.ui.toggleEditor(false)
  this.inDaChat = false
  xroom.api('renderControls')
}

function onDataIn (data) {
  const { pluginId, cmd, args } = data

  if (pluginId !== xroom.id || !cmd) {
    return
  }

  this.pdi = true

  switch (cmd) {
    case 'gotoLine':
      //  console.log('gotoLine', args)
      this.ui.editor.gotoLine(args[0], args[1])
      break

    case 'change':
      // console.log('change', args)
      this.ui.editor.session.getDocument().applyDeltas(args)
      break

    case 'select':
      // console.log('select', args, new TheRange(...args[0]))
      this.ui.editor.selection.clearSelection()
      for (const s of args) {
        this.ui.editor.selection.addRange(new TheRange(...s))
      }
      break
  }

  this.pdi = false
}

xroom.plugin = {
  ui: null,
  inDaChat: false,
  pdi: false, // processing data-in

  translations: {
    en: {
      iconCaption: 'Pair programming',
    },
    ru: {
      iconCaption: 'Парное\nпрограммирование',
    },
  },

  events: {
    'room/ready': onRoomEnter,
    'room/exit': onRoomExit,
    'data/in': onDataIn,
  },

  async register () {
    for (const script of ['ace', 'theme-twilight', 'mode-javascript']) {
      await this.loadAceModule(script)
    }

    // a class defined
    TheRange = window.ace.require('ace/range').Range

    await xroom.api('addUI', { component:
      <UI
        mbox={xroom.mbox}
        api={xroom.api}
        ref={(ref) => { this.ui = ref} }
        getPdi={() => this.pdi}
        onModuleRequest={(module) => this.loadAceModule(module)}
      />
    })

    this.addIcon()
  },

  unregister () {
    xroom.api('removeIcon')
    if (this.editor) {
      this.editor.destroy()
      this.editorDiv.parentNode.removeChild(this.editorDiv)
    }
  },

  isSupported () {
    return true
  },

  addIcon () {
    xroom.api('addIcon', {
      title: () => xroom.i18n.t('iconCaption'),
      onClick: () => this.ui.toggleEditor(),
      svg: props =>
        <svg width={props.size || 25} height={props.size || 25} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path stroke={props.color} d="M8 11l-6 5 6 5M24 11l6 5-6 5M20 5l-8 22" stroke-width={1.5 * 32/25} stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    })
  },

  async loadAceModule (module) {
    return xroom.api('appendScript', { src: `/plugins/${xroom.id}/ace/${module}.js` })
  }
}
