import * as React from 'preact'

export default class extends React.Component {
  constructor (props) {
    super(props)

    this.setState({
      url: '',
      urlInput: '',
    })

    this.urlChange = this.urlChange.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  urlChange (ev) {
    this.setState({urlInput: ev.target.value.trim()})
  }

  onKeyDown (ev) {
    ev.stopPropagation()
  }

  onKeyUp (ev) {
    ev.stopPropagation()

    if (ev.code === 'Enter') {
      this.setState({url: this.state.urlInput})
    }
  }

  render () {
    const { url, urlInput } = this.state
    const { ui, api, width } = this.props

    return (
      <div style={{...styles.container, width}}>
        <div style={styles.topBar}>
          <div style={styles.address}>
            <input
              type="text"
              style={styles.urlInput}
              onKeyDown={this.onKeyDown}
              onKeyUp={this.onKeyUp}
              onChange={this.urlChange}
            />
          </div>
          <button onClick={() => this.setState({url: urlInput})}>
            go
          </button>
        </div>
        <iframe
          src={url}
          style={styles.iframe}
        />
      </div>
    )
  }
}

const styles = {
  container: {
    height: '100%',
    background: '#f2f2f2',
    borderRadius: 'var(--box-r)',
    overflow: 'hidden',
  },
  topBar: {
    padding: '8px',
    display: 'flex',
  },
  address: {
    width: '100%',
  },
  urlInput: {
    width: '100%',
  },
  iframe: {
    border: 0,
    width: '100%',
    height: 'calc(100% - 36px)',
  },
}
