import * as React from 'preact'

class UI extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      recordings: [],
    }

    this.dialog = null
    this.openWith = this.openWith.bind(this)
    this.close = this.close.bind(this)
  }

  openWith (blob, mimeType) {
    const recordings = this.state.recordings

    recordings.push({blob, mimeType, ts: new Date()})
    this.setState({recordings})
    this.dialog && this.dialog.toggle()
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

    this.props.api('sendMessage', {
      to: 'all', from: 'self', pvt: false, uid: Math.random(),
      file: new File([recordings[i].blob], recordings[i].mimeType.replace('/', `-${i + 1}.`), { type: 'video/webm' }),
    })
  }

  close () {
    this.dialog && this.dialog.close()
  }

  render () {
    const { i18n, ui } = this.props
    const { recordings } = this.state
    const { Dialog, Button } = ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref}>
          <div style={styles.header} dangerouslySetInnerHTML={{__html: i18n.t('warn1') }}/>
          <div>
            {
              recordings.map((el, i) => {
                return (
                  <div style={styles.recRow} key={i}>
                    <div>{ i + 1 }) </div>
                    <div style={{margin: '0 8px'}}>{ el.ts.toISOString().replace('T', ' ').split('.')[0] }</div>
                    <div style={{marginRight: '8px'}}>{ (el.blob.size / 1024 / 1024).toFixed(2) + ' MB' }</div>
                    <div style={{display: 'flex'}}>
                      <Button onClick={() => this.save(i)} secondary>
                        { i18n.t('btnSave') }
                      </Button>
                      &nbsp;&nbsp;
                      <Button onClick={() => this.pushToChat(i)} secondary>
                        { i18n.t('btnToChat') }
                      </Button>
                    </div>
                  </div>
                )
              })
            }
          </div>

          <Button
            primary
            style={styles.button}
            onClick={this.close}
          >
            { i18n.t('btnClose') }
          </Button>
        </Dialog>
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
}

export default UI
