import React, { Component } from 'react'

class UI extends Component {

  constructor(props) {
    super(props)

    this.term = null
    this.state = {
      isShown: false,
    }

    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  componentDidUpdate() {
    if (this.state.isShown && window.Terminal) {
      this.term = new window.Terminal({cursorBlink: true, cols: 100})
      this.term.open(document.getElementById('plugin-nisdos-terminal'))
      this.term.write('Terminal v1.0, awaiting connection...')

      this.props.api('sendData', {data: {cmd: 'init', args: []}})
      this.term._core._onKey._listeners.push(({key, domEvent}) => {

        switch (domEvent.keyCode) {
          case 8:
            // backspace
            this.term.write('\b \b')
            this.props.api('sendData', {data: {cmd: 'key', args: ['\b']}})
            break

          case 46:
            // delete
            this.term.write(' \b')
            this.props.api('sendData', {data: {cmd: 'key', args: ['\x2E']}})
            break

          case 13:
            this.term.write('\n\r')
            this.props.api('sendData', {data: {cmd: 'line', args: [' ']}})
            break

          default:
            this.term.write(key)
            this.props.api('sendData', {data: {cmd: 'key', args: [key]}})
          //  console.log('keyCode', domEvent.keyCode)
        }

        domEvent.stopPropagation()
      })
    }
  }

  open () {
    this.setState({isShown: true})
    this.props.api('setHotKeysEnable', false)
  }

  close () {
    this.setState({isShown: false})
    this.props.api('setHotKeysEnable', true)
  }

  dataIn ({cmd, args}) {
    if (cmd === 'line') {
      for (const line of args[0].split('\n')) {
        this.term.writeln(line)
      }
      this.term.write('> ')
    }
    if (cmd === 'init-ok') {
      this.term.write('\x1bc> ')
    }
  }

  render () {
    const { i18n } = this.props
    const { isShown } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui}>
        <div style={styles.box}>
          <div id="plugin-nisdos-terminal" />
          <button
            onClick={this.close}
            style={styles.button}
          >
            { i18n.t('btnClose') }
          </button>
        </div>
      </div>
    )
  }
}

const styles = {
  ui: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    maxWidth: '100vw',
    background: '#333',
    border: '2px solid #fff'
  },
  button: {
    margin: '8px',
  },
}

export default UI
