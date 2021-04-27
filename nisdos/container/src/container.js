import * as React from 'preact'

export default class extends React.Component {
  constructor (props) {
    super(props)

    this.setState({
      url: '',
      urlInput: '',
    })

    this.urlChange = this.urlChange.bind(this)
  }

  urlChange (ev) {
    this.setState({urlInput: ev.target.value.trim()})
    ev.stopPropagation()
  }

  render () {
    const { url, urlInput } = this.state
    const { ui, api } = this.props

    return (
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={styles.address}>
            <input
              type="text"
              style={styles.urlInput}
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
    width: '50%',
    height: '100%',
    background: '#f2f2f2',
    borderRadius: '8px',
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
    height: 'calc(100% - 32px)',
  },
}
