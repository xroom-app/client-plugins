import React, { Component } from 'react'

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      recordings: [],
      isShown: false,
    }

    this.openWith = this.openWith.bind(this)
    this.close = this.close.bind(this)
  }

  openWith (blob, mimeType) {
    const recordings = this.state.recordings

    recordings.push({blob, mimeType, ts: new Date()})
    this.setState({isShown: true, recordings})
  }

  save (i) {
    const { recordings } = this.state

    if (!recordings[i]) {
      return
    }

    const
      a = document.createElement('a'),
      url = window.URL.createObjectURL(recordings[i].blob)

    document.body.appendChild(a)

    a.style = 'display:none'
    a.href = url
    a.download = recordings[i].mimeType.replace('/', `-${i + 1}.`)
    a.click()
    window.URL.revokeObjectURL(url)
  }

  pushToChat (i) {
    const { recordings } = this.state

    if (!recordings[i]) {
      return
    }

    this.props.api(
      'fileToChat',
      new File([recordings[i].blob],
      recordings[i].mimeType.replace('/', `-${i + 1}.`),
      {
        type: 'video/webm',
      }
    ))
  }

  close () {
    this.setState({isShown: false})
  }

  render () {
    const { i18n } = this.props
    const { isShown, recordings } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.ui}>
        <div style={styles.box}>
          <div style={styles.header} dangerouslySetInnerHTML={{__html: i18n.t('warn1') }}/>
          <div>
            {
              recordings.map((el, i) => {
                return (
                  <div style={styles.recRow} key={i}>
                    <div>{ i + 1 })</div>
                    <div>{ el.ts.toISOString().replace('T', ' ').split('.')[0] }</div>
                    <div>{ (el.blob.size / 1024 / 1024).toFixed(2) + ' MB' }</div>
                    <div>
                      <button onClick={() => this.save(i)}>
                        { i18n.t('btnSave') }
                      </button>
                      <button onClick={() => this.pushToChat(i)} style={styles.btn2}>
                        { i18n.t('btnToChat') }
                      </button>
                    </div>
                  </div>
                )
              })
            }
          </div>

          <button
            onClick={this.close}
            style={styles.button}
          >
            { i18n.t('btnClose') }
          </button>
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
    width: '480px',
    maxWidth: '100vw',
    padding: '16px',
    background: '#fff',
  },
  header: {
    lineHeight: '100%',
    textAlign: 'center',
    marginBottom: '16px',
    fontWeight: '400',
  },
  recRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  button: {
    marginTop: '8px',
  },
  btn2: {
    marginLeft: '8px',
  },
}

export default UI
