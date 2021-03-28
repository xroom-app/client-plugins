import * as React from 'preact'

export default class extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      recordings: [],
      isShown: false,
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
      // TODO: take type from MIME
      file: new File([recordings[i].blob], recordings[i].mimeType.replace('/', `-${i + 1}.`), { type: 'audio/webm' }),
    })
  }

  close () {
    this.dialog && this.dialog.close()
  }

  render () {
    const { i18n, ui } = this.props
    const { recordings } = this.state
    const { Button, Dialog } = ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref}>
        <div style={styles.header} dangerouslySetInnerHTML={{__html: i18n.t('warn1') }}/>
        <div>
          {
            recordings.map((el, i) => {
              return (
                <div style={styles.recRow} key={i}>
                  <div>{ i + 1 })</div>
                  <div style={{margin: '0 8px'}}>{ el.ts.toISOString().replace('T', ' ').split('.')[0] }</div>
                  <div style={{marginRight: '8px'}}>{ (el.blob.size / 1024 / 1024).toFixed(2) + ' MB' }</div>
                  <div style={{display: 'flex'}}>
                    <Button secondary onClick={() => this.save(i)}>
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
          onClick={this.close}
          style={{marginTop: '1rem'}}
        >
          { i18n.t('btnClose') }
        </Button>
      </Dialog>
    )
  }
}

const styles = {
  header: {
    lineHeight: '100%',
    textAlign: 'center',
    marginBottom: '24px',
    fontWeight: '400',
    fontSize: '20px',
  },
  recRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
}
