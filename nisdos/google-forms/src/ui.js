import React, { Component } from 'react'

class UI extends Component {
  toggleShow () {
    this.dialog && this.dialog.toggle()
  }

  onCreate () {
    window.open('https://docs.google.com/forms/u/0/create?usp=forms_home&ths=true', '_blank')
  }

  onCodeChange = (ev) => {
    const code = ev.target.value.trim()

    if (RegExp('<iframe([^>]*)>').test(code)) {
      this.props.api('sendMessage', {type: 'text', content: code, to: 'all'})
      this.dialog && this.dialog.close()
    }
  }

  render () {
    const { Dialog, Button } = this.props.ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref}>
          <Button
            primary
            onClick={this.onCreate}
          >
            Create new form
          </Button>
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
        </Dialog>
    )
  }
}

const styles = {
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
    width: '100%',
  },
  lastHint: {
    textAlign: 'left',
    marginTop: '10px',
  },
}

export default UI
