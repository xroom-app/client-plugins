import * as React from 'preact'

export default class extends React.Component {
  constructor (props) {
    super(props)

    this.setState({
      url: props.layout ? props.layout.filter(c => c.id === props.id)[0].url : '',
      urlInput: '',
    })

    this.urlChange = this.urlChange.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onSync = this.onSync.bind(this)
  }

  urlChange (ev) {
    let urlInput = ev.target.value.trim()

    if (!urlInput.startsWith('https://') && !urlInput.startsWith('http://')) {
      urlInput = 'https://' + urlInput
    }

    this.setState({urlInput})
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

  onSync () {
    const { url } = this.state
    const { id, internalSync } = this.props

    internalSync({id, url})
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url) {
      this.setState({
        url: nextProps.url,
        urlInput: nextProps.url,
      })
    }
  }

  render () {
    const { width } = this.props
    const { url, urlInput } = this.state

    return (
      <div style={{...styles.container, width}}>
        <div style={styles.topBar}>
          <div style={styles.address}>
            <input
              type="text"
              placeholder="https://"
              style={styles.urlInput}
              onKeyDown={this.onKeyDown}
              onKeyUp={this.onKeyUp}
              onChange={this.urlChange}
            />
          </div>
          <button
            style={styles.button}
            onClick={() => this.setState({url: urlInput})}
          >
            go
          </button>
          <button
            style={styles.button}
            onClick={this.onSync}
          >
            sync
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
    height: '1.5rem',
  },
  button: {
    height: '1.5rem',
    cursor: 'pointer',
  },
  iframe: {
    border: 0,
    width: '100%',
    height: 'calc(100% - 36px)',
  },
}
