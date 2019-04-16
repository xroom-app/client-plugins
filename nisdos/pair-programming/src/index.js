import React, { Component } from 'react'

// support hot-loading
if (!global._babelPolyfill) {
  require('babel-polyfill')
}

XROOM_PLUGIN({

  inDaChat: false,
  isShown: false,
  editor: null,
  pdi: false, // processing data-in

  async register () {
    this.onRoomEnter = this.onRoomEnter.bind(this)
    this.onRoomExit = this.onRoomExit.bind(this)
    this.onDataIn = this.onDataIn.bind(this)

    window.addEventListener('room/enter', this.onRoomEnter)
    window.addEventListener('room/exit', this.onRoomExit)
    window.addEventListener('data/in', this.onDataIn)

    for (const script of ['ace', 'theme-twilight', 'mode-javascript']) {
      await new Promise((resolve) => {
        const s = document.createElement('script')
        s.setAttribute('src', `/plugins/${this.id}/ace/${script}.js`)
        s.onerror = () => resolve(false)
        s.onload = () => resolve(true)
        document.head.appendChild(s)
      })
    }

    this.editorDiv = document.createElement('div')
    this.editorDiv.setAttribute('id', 'nisdos-pp-editor')
    this.editorDiv.setAttribute('style', 'position:absolute;top:0;left:0;width:100vw;height:calc(100vh - 72px);z-index:10;display:none')
    document.body.appendChild(this.editorDiv)

    this.editor = window.ace.edit('nisdos-pp-editor')
    this.editor.setTheme('ace/theme/twilight')

    const JavaScriptMode = ace.require('ace/mode/javascript').Mode
    this.editor.session.setMode(new JavaScriptMode())
    this.editor.setFontSize(16)

    this.editor.selection.on('changeCursor', () => {
      if (this.pdi) return
      const pos = this.editor.selection.getCursor()
      this.api('broadcastData', {cmd: 'gotoLine', args: [pos.row + 1, pos.column]})
    })

    this.editor.on('change', (delta) => {
      if (this.pdi) return
      this.api('broadcastData', {cmd: 'change', args: [delta]})
    })
  },

  unregister () {
    window.removeEventListener('room/enter', this.onRoomEnter)
    window.removeEventListener('room/exit', this.onRoomExit)
    window.removeEventListener('data/in', this.onDataIn)
    this.api('removeIcon')
    this.editor.destroy()
    this.editorDiv.parentNode.removeChild(this.editorDiv)
  },

  addIcon () {
    this.api('addIcon', {
      title: 'Pair program',
      onClick: () => { this.isShown ? this.hideEditor() : this.showEditor() },
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M12,6A3,3 0 0,0 9,9A3,3 0 0,0 12,12A3,3 0 0,0 15,9A3,3 0 0,0 12,6M6,8.17A2.5,2.5 0 0,0 3.5,10.67A2.5,2.5 0 0,0 6,13.17C6.88,13.17 7.65,12.71 8.09,12.03C7.42,11.18 7,10.15 7,9C7,8.8 7,8.6 7.04,8.4C6.72,8.25 6.37,8.17 6,8.17M18,8.17C17.63,8.17 17.28,8.25 16.96,8.4C17,8.6 17,8.8 17,9C17,10.15 16.58,11.18 15.91,12.03C16.35,12.71 17.12,13.17 18,13.17A2.5,2.5 0 0,0 20.5,10.67A2.5,2.5 0 0,0 18,8.17M12,14C10,14 6,15 6,17V19H18V17C18,15 14,14 12,14M4.67,14.97C3,15.26 1,16.04 1,17.33V19H4V17C4,16.22 4.29,15.53 4.67,14.97M19.33,14.97C19.71,15.53 20,16.22 20,17V19H23V17.33C23,16.04 21,15.26 19.33,14.97Z" />
        </svg>
    })
  },

  isSupported () {
    return true
  },

  showEditor () {
    this.editorDiv.style.display = 'block'
    this.isShown = true
  },

  hideEditor () {
    this.editorDiv.style.display = 'none'
    this.isShown = false
  },

  onRoomEnter (event) {
    this.addIcon()
    this.inDaChat = true
    this.addIcon()
    this.api('renderControls')
  },

  onRoomExit () {
    this.hideEditor()
    this.inDaChat = false
    this.api('removeIcon')
    this.api('renderControls')
  },

  onDataIn (event) {
    const { pluginId, cmd, args } = event.detail

    if (pluginId !== this.id || !cmd) return

    this.pdi = true

    switch (cmd) {
      case 'gotoLine':
      //  console.log('gotoLine', args)
        this.editor.gotoLine(args[0], args[1])
        break

      case 'change':
      //  console.log('change', args[0])
        this.editor.session.getDocument().applyDeltas(args)
        break
    }

    this.pdi = false
  }
})
