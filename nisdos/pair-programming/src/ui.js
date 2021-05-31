import * as React from 'preact'

const
  openSvg = <svg style={{width:'24px',height:'24px'}} viewBox="0 0 24 24"><path fill="#000" d="M19,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.89,4 4,4H10L12,6H19A2,2 0 0,1 21,8H21L4,8V18L6.14,10H23.21L20.93,18.5C20.7,19.37 19.92,20 19,20Z" /></svg>,
  dayNightSvg = <svg style={{width:'24px',height:'24px'}} viewBox="0 0 24 24"><path fill="#000" d="M7.5,2C5.71,3.15 4.5,5.18 4.5,7.5C4.5,9.82 5.71,11.85 7.53,13C4.46,13 2,10.54 2,7.5A5.5,5.5 0 0,1 7.5,2M19.07,3.5L20.5,4.93L4.93,20.5L3.5,19.07L19.07,3.5M12.89,5.93L11.41,5L9.97,6L10.39,4.3L9,3.24L10.75,3.12L11.33,1.47L12,3.1L13.73,3.13L12.38,4.26L12.89,5.93M9.59,9.54L8.43,8.81L7.31,9.59L7.65,8.27L6.56,7.44L7.92,7.35L8.37,6.06L8.88,7.33L10.24,7.36L9.19,8.23L9.59,9.54M19,13.5A5.5,5.5 0 0,1 13.5,19C12.28,19 11.15,18.6 10.24,17.93L17.93,10.24C18.6,11.15 19,12.28 19,13.5M14.6,20.08L17.37,18.93L17.13,22.28L14.6,20.08M18.93,17.38L20.08,14.61L22.28,17.15L18.93,17.38M20.08,12.42L18.94,9.64L22.28,9.88L20.08,12.42M9.63,18.93L12.4,20.08L9.87,22.27L9.63,18.93Z" /></svg>

class UI extends React.Component {
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
      if (this.props.getPdi()) {
        return
      }
      const pos = this.editor.selection.getCursor()

      this.props.api('sendData', {data: {cmd: 'gotoLine', args: [pos.row + 1, pos.column]}})
    })

    this.editor.selection.on('changeSelection', () => {
      if (this.props.getPdi()) {
        return
      }

      const
        ranges = [],
        sels = this.editor.selection.getAllRanges()

      for (const s of sels) {
        ranges.push([s.start.row, s.start.column, s.end.row, s.end.column])
      }

      // debounce
      if (this.selDebounceTimer) clearTimeout(this.selDebounceTimer)

      this.selDebounceTimer = setTimeout(() => {
        this.props.api('sendData', {data: {cmd: 'select', args: ranges}})
        this.selDebounceTimer = null
      }, 250)
    })

    this.editor.on('change', delta => {
      if (this.props.getPdi()) {
        return
      }
      this.props.api('sendData', {data: {cmd: 'change', args: [delta]}})
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
      this.props.mbox({text: 'Failed to load file'})
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
        style={{...styles.main, display: isShown ? 'block' : 'none', background: nightMode ? '#333' : '#fff' }}
      >
        <div ref={this.barRef} style={styles.bar}>
          <button onClick={() => this.fileSelector.click()} style={styles.button(nightMode)}>{ openSvg }</button>
          <button onClick={this.onDayNightClick} style={styles.button(nightMode)}>{ dayNightSvg }</button>
          <select onChange={this.onSyntaxChange} style={styles.ddb(nightMode)}>
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
            <option value="html">HTML</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <div id="nisdos-pp-editor" style={{height:'calc(100% - 46px)'}}/>
      </div>
    )
  }
}

const styles = {
  main: {
    position:'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100%',
  },
  bar: {
    padding: '4px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  button: (nightMode) => ({
    display: 'flex',
    padding: '2px',
    height: '32px',
    filter: `invert(${nightMode ? 100 : 0}%)`,
    cursor: 'pointer',
    marginRight: '4px',
  }),
  ddb: (nightMode) => ({
    height: '32px',
    color: '#000',
    padding: '0 4px',
    filter: `invert(${nightMode ? 100 : 0}%)`,
    cursor: 'pointer',
  }),
}

export default UI
