import React, { Component } from 'react'
import CanvasDraw from 'react-canvas-draw'

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
    }

    this.draw = null
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    const { isShown } = this.state
    this.setState({isShown: !isShown})
  }

  render () {
    const { isShown } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui}>
        <div style={styles.controls}>
          <div onClick={() => this.draw.clear()} style={styles.button}>
            <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
              <path fill="#333" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </div>
          <div onClick={() => this.draw.undo()} style={styles.button}>
            <svg style={{width: '24px', height: '24px'}} viewBox="0 0 24 24">
              <path fill="#333" d="M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z" />
            </svg>
          </div>
        </div>
        <CanvasDraw
          ref={ref => this.draw = ref}
          canvasWidth="100%"
          canvasHeight="100%"
          brushRadius={1}
          lazyRadius={0}
          loadTimeOffset={0}
          brushColor="#111"
          immediateLoading={true}
        />
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
    height: 'calc(100% - 91px)',
    backgroundColor: '#fff',
  },
  controls: {
    paddingTop: '2px',
    borderBottom: '1px solid #aaa',
    display: 'flex',
  },
  button: {
    cursor: 'pointer',
    padding: '0 2px',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
}

if (window.matchMedia('screen and (max-width: 480px)').matches) {
  styles.ui = {
    ...styles.ui,
    height: 'calc(100% - 83px)',
  }
}

export default UI
