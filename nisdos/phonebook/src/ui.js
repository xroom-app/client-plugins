import React, { Component } from 'react'

function djb2(str){
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i) /* hash * 33 + c */
  }

  return hash
}

function strColorHash(str) {

  while (str.length < 6) {
    str += str
  }

  const hash = djb2(str)
  const r = (hash & 0xFF0000) >> 16
  const g = (hash & 0x00FF00) >> 8
  const b = hash & 0x0000FF

  return '#' + ('0' + r.toString(16)).substr(-2) + ('0' + g.toString(16)).substr(-2) + ('0' + b.toString(16)).substr(-2)
}

if (!Object.entries) {
  Object.entries = function (obj) {
    var
      ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i)

    while (i--)
      resArray[i] = [ownProps[i], obj[ownProps[i]]]

    return resArray
  }
}

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      isShown: false,
      storage: props.storage,
    }

    this.toggle = this.toggle.bind(this)

    const style = document.createElement('style')

    style.appendChild(document.createTextNode('.phonebook__row:hover{background-color:#333}'))
    document.getElementsByTagName('head')[0].appendChild(style)
  }

  toggle () {
    const { isShown } = this.state
    this.setState({isShown: !isShown})
  }

  sync (storage) {
    this.setState({storage})
  }

  goto (roomId) {
    this.props.api('goToRoom', { roomId })
  }

  render () {
    const { isShown, storage } = this.state

    if (!isShown) {
      return null
    }

    const data = Object.entries(storage.stats).sort(function (a, b) {
      return a[1] === b[1] ? 0 : a[1] > b[1] ? -1 : 1
    })

    return (
      <div style={styles.ui}>
        {
          data.map(([k, v], i) => {
            return (
              <div key={i} style={styles.row} className='phonebook__row' onClick={() => this.goto(k)}>
                <div style={{...styles.ava, backgroundColor: strColorHash(k)}}>
                  { k.substr(0,2).toUpperCase() }
                </div>
                <div style={styles.rowText}>
                  { k }
                  {
                    (v - 0) ? ` (${v})` : ''
                  }
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}

const styles = {
  ui: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '25vw',
    maxWidth: '360px',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 11,
    padding: 0,
    overflowY: 'auto',
  },
  row: {
    padding: '8px',
    borderBottom: '1px solid #666',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  ava: {
    width: '48px',
    minWidth: '48px',
    height: '48px',
    borderRadius: '48px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '8px',
    fontSize: '24px',
  },
  rowText: {
    overflow: 'hidden',
  },
}

if (window.matchMedia('screen and (max-width: 480px)').matches) {
  styles.ui = {
    ...styles.ui,
    width: '100vw',
    maxWidth: '100%',
    height: 'calc(100% - 83px)',
  }
}

export default UI
