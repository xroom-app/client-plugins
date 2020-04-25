import React, { Component } from 'react'

// support hot-loading
if (!global._babelPolyfill) {
  require('babel-polyfill')
}

let TheRange = null

const
  openSvg = <svg style={{width:'16px',height:'16px'}} viewBox="0 0 24 24"><path fill="#000" d="M19,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.89,4 4,4H10L12,6H19A2,2 0 0,1 21,8H21L4,8V18L6.14,10H23.21L20.93,18.5C20.7,19.37 19.92,20 19,20Z" /></svg>,
  dayNightSvg = <svg style={{width:'16px',height:'16px'}} viewBox="0 0 24 24"><path fill="#000" d="M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z" /></svg>

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
      nightMode: false,
    }

    this.editor = null
    this.selDebounceTimer = null
    this.barRef = React.createRef()
    this.fileSelector = this.buildFileSelector()

    this.toggleEditor = this.toggleEditor.bind(this)
    this.onDayNightClick = this.onDayNightClick.bind(this)
    this.onSyntaxChange = this.onSyntaxChange.bind(this)
    this.onFileChange = this.onFileChange.bind(this)
  }

  async componentDidMount() {
    this.editor = window.ace.edit('nisdos-pp-editor')

    const JavaScriptMode = ace.require('ace/mode/javascript').Mode
    this.editor.session.setMode(new JavaScriptMode())
    this.editor.setFontSize(16)
    this.editor.session.setValue('')

    this.editor.selection.on('changeCursor', () => {
      if (this.props.getPdi()) return
      const pos = this.editor.selection.getCursor()
      this.props.api('broadcastData', {cmd: 'gotoLine', args: [pos.row + 1, pos.column]})
    })

    this.editor.selection.on('changeSelection', () => {
      if (this.props.getPdi()) return

      const
        ranges = [],
        sels = this.editor.selection.getAllRanges()

      for (const s of sels) {
        ranges.push([s.start.row, s.start.column, s.end.row, s.end.column])
      }

      // debounce
      if (this.selDebounceTimer) clearTimeout(this.selDebounceTimer)

      this.selDebounceTimer = setTimeout(() => {
        this.props.api('broadcastData', {cmd: 'select', args: ranges})
        this.selDebounceTimer = null
      }, 250)
    })

    this.editor.on('change', (delta) => {
      if (this.props.getPdi()) return
      this.props.api('broadcastData', {cmd: 'change', args: [delta]})
    })
  }

  static dumpEvent (ev) {
    ev.stopPropagation()
    ev.preventDefault()
  }

  onDrop (ev) {
    UI.dumpEvent(ev)
    this.loadFile(ev.dataTransfer.files[0])
  }

  toggleEditor (set = null) {
    const isShown = set === null ? !this.state.isShown : set

    this.setState({isShown})
    this.props.api('setHotKeysEnable', !isShown)
  }

  onDayNightClick () {

    const { nightMode } = this.state

    this.editor.setTheme(nightMode ? 'ace/theme/chrome' : 'ace/theme/twilight')
    this.setState({nightMode: !nightMode})
  }

  onFileChange (ev) {
    this.loadFile(ev.target.files[0])
  }

  loadFile (file) {
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const contents = ev.target.result
        this.editor.session.setValue(contents)
      }
      reader.readAsText(file)
    } else {
      alert('Failed to load file')
    }
  }

  async onSyntaxChange (ev) {
    const value = ev.target.value

    await this.props.onModuleRequest(`mode-${value}`)
    const SyntaxMode = window.ace.require(`ace/mode/${value}`).Mode

    this.editor.session.setMode(new SyntaxMode())
  }

  buildFileSelector () {
    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.onchange = this.onFileChange.bind(this)
    return fileSelector
  }

  render () {

    const { isShown, nightMode } = this.state

    return (
      <div
        onDrop={ev => this.onDrop(ev)}
        onDragOver={UI.dumpEvent}
        onDragEnter={UI.dumpEvent}
        style={{display:isShown ? 'block' : 'none',position:'absolute',top:0,left:0,width:'100vw',height:'calc(100% - 72px)',zIndex:10}}
      >
        <div ref={this.barRef} style={{padding:'4px',display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
          <button onClick={() => this.fileSelector.click()} style={{display:'flex',padding:'2px',height:'26px',filter:`invert(${nightMode ? 100 : 0}%)`}}>{ openSvg }</button>
          <button onClick={this.onDayNightClick} style={{display:'flex',padding:'2px',height:'26px',filter:`invert(${nightMode ? 100 : 0}%)`}}>{ dayNightSvg }</button>
          <select onChange={this.onSyntaxChange} style={{height:'26px',color:'#000',filter:`invert(${nightMode ? 100 : 0}%)`}}>
            <option value="javascript">JavaScript</option>
            <option value="php">PHP</option>
            <option value="java">Java</option>
            <option value="c_cpp">C/C++</option>
            <option value="python">Python</option>
            <option value="golang">Go</option>
            <option value="mysql">MySQL</option>
            <option value="sh">Shell</option>
            <option value="jsx">JSX (React)</option>
            <option value="css">CSS</option>
            <option value="sass">SASS</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div id="nisdos-pp-editor" style={{height:'calc(100% - 36px)'}}/>
      </div>
    )
  }
}

function onRoomEnter () {
  this.addIcon()
  this.inDaChat = true
  this.addIcon()
  this.api('renderControls')
}

function onRoomExit () {
  this.ui.toggleEditor(false)
  this.inDaChat = false
  this.api('removeIcon')
  this.api('renderControls')
}

function onDataIn (data) {
  const { pluginId, cmd, args } = data

  if (pluginId !== this.id || !cmd) return

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

XROOM_PLUGIN({

  ui: null,
  inDaChat: false,
  pdi: false, // processing data-in

  translations: {
    en: {
      iconCaption: 'Pair program',
    },
    ru: {
      iconCaption: 'Парное\nпрограммирование',
    },
  },

  events: {
    'ss/onJoin': onRoomEnter,
    'room/exit': onRoomExit,
    'data/in': onDataIn,
  },

  async register () {
    for (const script of ['ace', 'theme-twilight', 'mode-javascript']) {
      await this.loadAceModule(script)
    }

    // a class defined
    TheRange = window.ace.require('ace/range').Range

    await this.api('addUI', { component:
      <UI
        api={this.api}
        ref={(ref) => { this.ui = ref} }
        getPdi={() => this.pdi}
        onModuleRequest={(module) => this.loadAceModule(module)}
      />
    })

    this.addIcon()
  },

  unregister () {
    this.api('removeIcon')
    if (this.editor) {
      this.editor.destroy()
      this.editorDiv.parentNode.removeChild(this.editorDiv)
    }
  },

  isSupported () {
    return true
  },

  addIcon () {
    this.api('addIcon', {
      title: this.i18n.t('iconCaption'),
      onClick: () => this.ui.toggleEditor(),
      svg: props =>
        <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24">
          <path fill={props.color || '#000'} d="M12,6A3,3 0 0,0 9,9A3,3 0 0,0 12,12A3,3 0 0,0 15,9A3,3 0 0,0 12,6M6,8.17A2.5,2.5 0 0,0 3.5,10.67A2.5,2.5 0 0,0 6,13.17C6.88,13.17 7.65,12.71 8.09,12.03C7.42,11.18 7,10.15 7,9C7,8.8 7,8.6 7.04,8.4C6.72,8.25 6.37,8.17 6,8.17M18,8.17C17.63,8.17 17.28,8.25 16.96,8.4C17,8.6 17,8.8 17,9C17,10.15 16.58,11.18 15.91,12.03C16.35,12.71 17.12,13.17 18,13.17A2.5,2.5 0 0,0 20.5,10.67A2.5,2.5 0 0,0 18,8.17M12,14C10,14 6,15 6,17V19H18V17C18,15 14,14 12,14M4.67,14.97C3,15.26 1,16.04 1,17.33V19H4V17C4,16.22 4.29,15.53 4.67,14.97M19.33,14.97C19.71,15.53 20,16.22 20,17V19H23V17.33C23,16.04 21,15.26 19.33,14.97Z" />
        </svg>
    })
  },

  async loadAceModule (module) {
    return new Promise((resolve) => {
      const s = document.createElement('script')
      s.setAttribute('src', `/plugins/${this.id}/ace/${module}.js`)
      s.onerror = () => resolve(false)
      s.onload = () => resolve(true)
      document.head.appendChild(s)
    })
  }
})
