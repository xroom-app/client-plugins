import React, { Component } from 'react'

// styling docs: https://help.calendly.com/hc/en-us/articles/360019861794-Common-embed-questions#1

class UI extends Component {

  constructor (props) {
    super(props)

    this.state = {
      isShown: false,
      extId: false,
    }

    this.toggleShow = this.toggleShow.bind(this)
    this.onExtIdChange = this.onExtIdChange.bind(this)
  }

  toggleShow () {
    const { isShown } = this.state

    if (!window.Calendly) {
      alert('We couldn\'t load Calendly widget from their site. That\'s strange.')
      return
    }

    if (!isShown) {

      setTimeout(() => {
        window.Calendly.initInlineWidget({
          url: 'https://calendly.com/vladimir-osipov/?hide_event_type_details=1&hide_landing_page_details=1',
          parentElement: document.getElementById('calendly-container'),
        })
      }, 50)
    }

    this.setState({isShown: !isShown})
  }

  onExtIdChange (ev) {

  }

  render () {

    const { isShown } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui} onClick={() => this.setState({isShown: false})}>
        <div style={styles.box}>
          <input type="text" onChange={this.onExtIdChange} placeholder="Your Calendly link" style={styles.extIdInput}/>
          <div id="calendly-container" style={{flex: 1}}/>
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
    minWidth: '640px',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
  },
  extIdInput: {
    lineHeight: '',
  },
}

export default UI
