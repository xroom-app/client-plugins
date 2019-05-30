import React, { Component } from 'react'

class UI extends Component {

  constructor(props) {
    super(props)

    this.refSource = React.createRef()
    this.refPlot = React.createRef()

    this.state = {
      isShown: false,
    }

    this.toggle = this.toggle.bind(this)
    this.close = this.close.bind(this)
  }

  toggle () {
    const { isShown } = this.state
    this.setState({isShown: !isShown})
  }

  close () {
    this.setState({isShown: false})
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
          <canvas ref={this.refSource} width="100" height="100" style={{display: 'none'}} />
          <canvas ref={this.refPlot} width="320" height="30" />
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
    width: '480px',
    maxWidth: '100vw',
    padding: '16px',
    background: '#fff',
  },
  button: {
    marginTop: '8px',
  },
}

export default UI
