import React, { Component } from 'react'

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
      password: null,
      isLocked: false,
      isPassShown: false,
    }

    this.bouncing = null
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  open () {
    this.setState({isShown: true})
  }

  close () {
    this.setState({isShown: false})
  }

  showPassword = () => {
    this.setState({isPassShown: !this.state.isPassShown})
  }

  setLock (isLocked) {
    this.setState({isLocked})
  }

  setPassword (password) {
    this.setState({password})
  }

  onInputChange = (ev) => {
    if (this.bouncing) {
      clearTimeout(this.bouncing)
    }
    const password = ev.target.value.trim()

    this.bouncing = setTimeout(() => {
      this.props.onPasswordSet(password)
      this.bouncing = null
    }, 500)
  }

  render () {
    const { i18n, onLockToggle, lockStrings } = this.props
    const { isShown, isPassShown, isLocked, password } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui} onClick={() => this.close()}>
        <div style={styles.box} onClick={ev => ev.stopPropagation()}>
          <div style={styles.header}>
            { i18n.t(
              isLocked || password ?
                (
                  isLocked ? 'roomLocked' : 'roomProtected'
                ) : 'roomOpen'
            ) }
          </div>
          <div style={styles.icons} >
            <div>
              <svg style={styles.svg} viewBox="0 0 24 24" onClick={onLockToggle}>
                <path fill="#333" d={lockStrings[isLocked * 1]} />
              </svg>
            </div>
            <div>
              <svg style={styles.svg} viewBox="0 0 24 24" onClick={this.showPassword}>
                <path fill="#333" d="M17,7H22V17H17V19A1,1 0 0,0 18,20H20V22H17.5C16.95,22 16,21.55 16,21C16,21.55 15.05,22 14.5,22H12V20H14A1,1 0 0,0 15,19V5A1,1 0 0,0 14,4H12V2H14.5C15.05,2 16,2.45 16,3C16,2.45 16.95,2 17.5,2H20V4H18A1,1 0 0,0 17,5V7M2,7H13V9H4V15H13V17H2V7M20,15V9H17V15H20M8.5,12A1.5,1.5 0 0,0 7,10.5A1.5,1.5 0 0,0 5.5,12A1.5,1.5 0 0,0 7,13.5A1.5,1.5 0 0,0 8.5,12M13,10.89C12.39,10.33 11.44,10.38 10.88,11C10.32,11.6 10.37,12.55 11,13.11C11.55,13.63 12.43,13.63 13,13.11V10.89Z" />
              </svg>
            </div>
          </div>
          <div>
            {
              isPassShown &&
                <input
                  defaultValue={password || ''}
                  type="password"
                  style={styles.input}
                  placeholder={i18n.t('pwdPlaceholder')}
                  autoFocus={true}
                  onChange={this.onInputChange}
                  onKeyUp={ev => ev.stopPropagation()}
                />
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
    background: 'rgba(0,0,0,.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '300px',
    maxWidth: '100vw',
    padding: '16px',
    background: '#fff',
    borderRadius: '4px',
  },
  header: {
    textAlign: 'center',
    fontSize: '18px',
  },
  icons: {
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-evenly',
    minHeight: '100px',
    alignItems: 'center',
  },
  svg: {
    width: '64px',
    height: '64px',
    cursor: 'pointer',
  },
  input: {
    width: 'calc(100% - 18px)',
    border: '1px solid rgb(204, 204, 204)',
    padding: '8px',
    borderRadius: '4px',
  },
}

export default UI
