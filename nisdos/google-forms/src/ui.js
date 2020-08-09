import React, { Component } from 'react'

class UI extends Component {
  constructor (props) {
    super(props)

    this.state = {
      isShown: false,
    }
  }

  toggleShow () {
    const { isShown } = this.state
    this.setState({isShown: !isShown})
  }

  onCreate () {
    window.open('https://docs.google.com/forms/u/0/create?usp=forms_home&ths=true', '_blank')
  }

  onCodeChange = (ev) => {
    const code = ev.target.value.trim()

    if (RegExp('<iframe([^>]*)>').test(code)) {
      this.props.api('sendMessage', {to: 'all', message: code})
      this.setState({isShown: false})
    }
  }

  render () {
    const { isShown } = this.state

    return (
      <div style={{...styles.ui, ...(isShown ? {} : styles.uiOffset)}}>
        <div style={styles.box}>
          <button
            style={styles.btnCreate}
            onClick={this.onCreate}
          >
            Create new form
          </button>
          <div style={styles.steps}>
            <ol style={{paddingLeft: '25px'}}>
              <li>Make sure everyone is in the chat (we do not store messages)</li>
              <li>Press 'Create new form', you'll be directed to a predefined template</li>
              <li>When you are done press 'Send' in the top left corner</li>
              <li>Choose '&lt; &gt;' in 'Send via' and press 'Copy'</li>
              <li>Paste the code below</li>
            </ol>
          </div>
          <textarea
            rows="4"
            style={styles.url}
            onChange={this.onCodeChange}
            onKeyDown={ev => ev.stopPropagation()}
            placeholder="iframe code from Google..."
          />
          <div style={styles.lastHint}>The next time you may simply paste this code into the chat.</div>
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
    display: 'flex',
    borderRadius: '4px',
    background: '#fff',
    minWidth: '640px',
    minHeight: '330px',
    flexDirection: 'column',
    padding: '16px',
    lineHeight: '150%',
    fontSize: '18px',
  },
  steps: {
    flex: 1,
    textAlign: 'left',
  },
  btnCreate: {
    padding: '4px',
    fontSize: '18px',
    cursor: 'pointer',
  },
  url: {
    padding: '4px',
    border: '0.5px solid #888',
    borderRadius: '4px',
    fontSize: '14px',
  },
  lastHint: {
    textAlign: 'left',
    marginTop: '10px',
  },
}

export default UI
