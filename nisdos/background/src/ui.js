import React, { Component } from 'react'

const modeNameCodes = ['modeNormal', 'modeBlur', 'modeColorPop', 'modeImage']

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
            {
              [0, 1, 2, 3].map((el, i) =>
                <div
                  key={i}
                  style={{...styles.mode, ...(selectedId === i ? styles.selectedMode : {})}}
                  onClick={() => {
                    onModeSelect(i)
                    this.setState({selectedId: i})
                  }}
                >
                  { i18n.t(modeNameCodes[i]) }
                </div>
              )
            }
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
