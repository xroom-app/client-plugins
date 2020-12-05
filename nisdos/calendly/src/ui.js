import React, { Component, Fragment } from 'react'

// styling docs: https://help.calendly.com/hc/en-us/articles/360019861794-Common-embed-questions#1

const backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle'%3ELoading...%3C/text%3E%3C/svg%3E\") no-repeat center"

class UI extends Component {

  constructor (props) {
    super(props)

    this.state = {
      saved: false,
      isShown: false,
      extId: (JSON.parse(localStorage.getItem('nisdos/calendly')) ?? {}).extId || null,
    }
  }

  toggleShow () {
    const { isShown } = this.state
    this.setState({isShown: !isShown})
  }

  initWidget (username) {
    if (!window.Calendly) {
      alert('We couldn\'t load Calendly widget from their site. That\'s strange.')
      return
    }

    setTimeout(() => {
      window.Calendly.initInlineWidget({
        url: `https://calendly.com/${username}/?hide_event_type_details=1&hide_landing_page_details=1`,
        parentElement: document.getElementById('calendly-container'),
      })
    }, 50)
  }

  onExtIdChange = (ev) => {
    this.setState({extId: ev.target.value.trim()})
  }

  onExtIdKeyDown = (ev) => {
    ev.stopPropagation()

    if (ev.key === 'Enter') {
      setTimeout(this.onSave, 100)
    }
  }

  onSave = () => {
    const { extId } = this.state

    localStorage.setItem('nisdos/calendly', JSON.stringify({extId}))
    this.setState({saved: true})
    this.initWidget(extId)
  }

  onReset = () => {
    this.setState({saved: false})
  }

  onShare = () => {
    const { isInDaChat, api, mbox } = this.props

    if (isInDaChat()) {
      api('sendMessage', {type: 'text', content: `Book me here: https://calendly.com/${this.state.extId}`, to: 'all'})
      mbox({text: 'Sent to everyone in the chat'})
    } else {
      mbox({text: 'Enter a room first'})
    }
  }

  render () {
    const { isShown, saved, extId } = this.state

    return (
      <div style={{...styles.ui, ...(isShown ? {} : styles.uiOffset)}}>
        <div style={saved ? styles.fullBox : styles.box}>
          {
            saved ?
              <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                <div id="calendly-container" style={{flex: 1, background: backgroundImage}} />
                <div>
                  <button style={styles.topButton} onClick={this.onReset}>Reset</button>
                  <button style={styles.topButton} onClick={this.onShare}>Share</button>
                </div>
              </div>
              :
              <Fragment>
                <div style={styles.url}>
                  <span>https://calendly.com/</span>
                  <input
                    defaultValue={extId}
                    type="text"
                    onChange={this.onExtIdChange}
                    placeholder="username"
                    style={styles.extIdInput}
                    autoFocus={true}
                    onKeyDown={this.onExtIdKeyDown}
                    onKeyUp={ev => ev.stopPropagation()}
                  />
                </div>
                <button
                  style={styles.extIdSave}
                  onClick={this.onSave}
                >
                  Confirm
                </button>
              </Fragment>
          }
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
  uiOffset: {
    position: 'fixed',
    top: '100vh',
    left: '100vw',
  },
  box: {
    background: '#fff',
    width: '360px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '16px',
    borderRadius: '4px',
  },
  fullBox: {
    display: 'flex',
    borderRadius: '4px',
    background: '#fff',
    minWidth: '640px',
    minHeight: '500px',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  url: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
  },
  extIdInput: {
    border: '0.5px solid #888',
    borderRadius: '4px',
    padding: '2px',
    fontSize: '15px',
    width: '202px',
  },
  extIdSave: {
    marginTop: '16px',
    cursor: 'pointer',
  },
  topButton: {
    margin: '8px',
  },
}

export default UI
