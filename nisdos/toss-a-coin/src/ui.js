import React, { Component } from 'react'

class UI extends Component {

  constructor (props) {
    super(props)

    this.state = {
      isShown: false,
      face: null,
    }

    this.toggleShow = this.toggleShow.bind(this)

    const style = document.createElement('style')
    style.innerHTML = '@keyframes flipHeads {\
      from { transform: rotateY(0); }\
      to { transform: rotateY(1800deg); }\
    }\
    @keyframes flipTails {\
      from { transform: rotateY(0); }\
      to { transform: rotateY(1980deg); }\
    }'

    document.getElementsByTagName('head')[0].appendChild(style)
  }

  toggleShow () {
    const { isShown } = this.state
    this.setState({isShown: !isShown})
  }

  toss (ev) {
    ev.stopPropagation()

    const
      flipResult = Math.random(),
      div = document.getElementById('nisdos-toss-a-coin-main')

    div.style.animation = null

    setTimeout(function () {
      if (flipResult <= 0.5) {
        div.style.animation = 'flipHeads 3s ease-out forwards'
      } else {
        div.style.animation = 'flipTails 3s ease-out forwards'
      }
    }, 100)
  }

  render () {

    const { i18n } = this.props
    const { isShown } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui} onClick={() => this.setState({isShown: false})}>
        <div style={styles.box}>
          <div id="nisdos-toss-a-coin-main" style={styles.coin} onClick={(ev) => this.toss(ev)}>
            <div style={{...styles.coinDiv, ...styles.sideA}} />
            <div style={{...styles.coinDiv, ...styles.sideB}} />
          </div>
          <h2 style={styles.h2}>{ i18n.t('hint') }</h2>
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
    background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAANUlEQVQYlWNgYGD4TyRG5SABnAqxAQyFDFgU/0dTjCmAi43LWnTrMdyIzibPM+geQncf8QoBDFw9w5LT4R0AAAAASUVORK5CYII=")',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    padding: '16px',
    paddingTop: '28px',
    background: '#fff',
    perspective: '800px',
  },
  coin: {
    position: 'relative',
    margin: '0 auto',
    width: '100px',
    height: '100px',
    cursor: 'pointer',
    transition: 'transform 1s ease-in',
    transformStyle: 'preserve-3d',
  },
  coinDiv: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    boxShadow: 'inset 0 0 45px rgba(255,255,255,.3), 0 12px 20px -10px rgba(0,0,0,.4)',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  sideA: {
    zIndex: 100,
    backgroundColor: 'red',
  },
  sideB: {
    transform: 'rotateY(-180deg)',
    backgroundColor: 'blue',
  },
  h2: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#888',
  },
}

export default UI
