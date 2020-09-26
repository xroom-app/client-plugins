import React, { Component } from 'react'

class UI extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedId: 0,
      isShown: false,
    }
    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow () {
    const { isShown } = this.state

    this.setState({isShown: !isShown})
  }


  render () {
    const { isShown, selectedId } = this.state
    const { onModeSelect, i18n } = this.props

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui} onClick={() => this.setState({isShown: false})}>
        <div style={styles.box}>
          <div style={styles.modes}>
            <div
              key={0}
              style={{...styles.mode, ...(selectedId === 0 ? styles.selectedMode : {})}}
              onClick={() => {
                onModeSelect(0)
                this.setState({selectedId: 0})
              }}
            >
              { i18n.t('modeNormal') }
            </div>
            <div
              key={1}
              style={{...styles.mode, ...(selectedId === 1 ? styles.selectedMode : {})}}
              onClick={() => {
                onModeSelect(1)
                this.setState({selectedId: 1})
              }}
            >
              { i18n.t('modeBlur') }
            </div>
          </div>
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
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #eee',
    maxWidth: 'calc(100vw - 16px)',
  },
  modes: {
    display: 'flex',
    overflow: 'auto',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  mode: {
    display: 'flex',
    margin: '16px',
    cursor: 'pointer',
    minWidth: '100px',
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    border: '2px solid #ccc',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: '#ccc',
  },
  selectedMode: {
    borderColor: '#666',
    color: '#333',
  },
}

export default UI
