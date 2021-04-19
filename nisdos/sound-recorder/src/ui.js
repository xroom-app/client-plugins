import * as React from 'preact'

export default class extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      recordings: [],
      isShown: false,
      recOn: false,
    }

    this.dialog = null
    this.push = this.push.bind(this)
    this.open = this.open.bind(this)
    this.close = this.close.bind(this)
  }

  open () {
    this.dialog && this.dialog.toggle()
  }

  push (blob, mimeType) {
    const recordings = this.state.recordings

    recordings.push({blob, mimeType, ts: new Date()})
    this.setState({recordings})
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
    const { i18n, ui, startRec, stopRec } = this.props
    const { recordings, recOn } = this.state
    const { Button, Dialog } = ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref} style={{minWidth: '10rem'}}>
        <div style={styles.content}>
          <div style={styles.header}>
            <svg width="25" height="25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path stroke="var(--box-1)" d="M12.5 7.3v10.4M15.6 10.4v4.2M18.8 8.3v8.4M21.9 13.5v-2M9.4 4.2v16.6M6.3 9.4v6.2M3.1 13.5v-2" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{margin: '0 auto 0 1rem'}}>{ i18n.t('header') }</span>
            <svg style={{cursor: 'pointer'}} onClick={this.close} width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L4 4M21 4L4 21" stroke="var(--box-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <Button
            primary
            onClick={() => {
              this.setState({recOn: !recOn})
              recOn ? stopRec() : startRec()
            }}
          >
            { i18n.t(recOn ? 'btnStop' : 'btnStart') }
          </Button>

          {
            recordings.length ?
              <>
                <div style={styles.filesHeader}>{ i18n.t('files') }</div>
                <div style={styles.filesHeader2}>({ i18n.t('warn1') })</div>
              </>
              : null
          }
        </div>

        <div>
          {
            recordings.map((el, i) => {
              return (
                <div style={styles.recRow} key={i}>
                  <div>{ i + 1 })</div>
                  <div style={{margin: '0px auto 0 0.5rem'}}>{ el.ts.toISOString().replace('T', ' ').split('.')[0] }</div>
                  <div style={{margin: 'auto'}}>{ (el.blob.size / 1024 / 1024).toFixed(2) + ' MB' }</div>
                  <div style={{display: 'flex'}}>
                    <a title={ i18n.t('btnToChat') } href="#" onClick={ev => ev.preventDefault()}>
                      <svg onClick={() => this.pushToChat(i)} style={{cursor: 'pointer'}} width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="var(--box-1)" d="M19.1 5L3.5 9.4a.7.7 0 00-.1 1.3l7.2 3.4.3.3 3.4 7.2a.7.7 0 001.3 0L20 5.8A.7.7 0 0019 5zM11 14l4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                    &nbsp; &nbsp;
                    <a title={ i18n.t('btnSave') } href="#" onClick={ev => ev.preventDefault()}>
                      <svg onClick={() => this.save(i)} style={{cursor: 'pointer'}} width="20" height="20" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path stroke="var(--box-1)" d="M8.4 10.7l4.1 4.1 4.1-4M12.5 3.9v11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path stroke="var(--box-1)" d="M21.9 13.3v7a.8.8 0 01-.8.8H3.9a.8.8 0 01-.8-.8v-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </a>
                  </div>
                </div>
              )
            })
          }
        </div>
      </Dialog>
    )
  }
}

const styles = {
  content: {
    minWidth: '21rem',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: '2.5rem',
    fontSize: '1.25rem',
    fontWeight: '500',
  },
  filesHeader: {
    width: '100%',
    fontSize: '0.88rem',
    margin: '3rem 0 0',
    fontWeight: '400',
  },
  filesHeader2: {
    width: '100%',
    fontSize: '0.7rem',
    fontWeight: '300',
    borderBottom: '0.5px solid',
    paddingBottom: '0.5rem',
  },
  recRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    fontSize: '0.88rem',
  },
}
