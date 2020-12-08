import React, { Component, Fragment } from 'react'

const
  nums = (num) => num > 9 ? num : '0' + num,
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function toICalTime(d) {
  return `${d.getFullYear()}${nums(d.getMonth() + 1)}${nums(d.getDate())}T${nums(d.getHours())}${nums(d.getMinutes())}${nums(d.getSeconds())}`
}

class UI extends Component {
  constructor (props) {
    super(props)
    const
      ts = new Date(),
      ts2 = new Date(ts.getTime() + 1000 * 1800)

    this.state = {
      icsUrl: null,
      icsBlob: null,
      inDaChat: false,
      summaryString: 'My xroom.app meeting',
      timeString: `${nums(ts.getHours())}:${nums(ts.getMinutes())}`,
      time2String: `${nums(ts2.getHours())}:${nums(ts2.getMinutes())}`,
      dateString: `${ts.getFullYear()}-${nums(ts.getMonth() + 1)}-${nums(ts.getDate())}`,
    }

    this.toggleShow = this.toggleShow.bind(this)
  }

  toggleShow () {
    this.setState({icsUrl: null})
    this.dialog && this.dialog.toggle()
  }

  onChangeDate = (ev) => {
    this.setState({dateString: ev.target.value})
  }

  onChangeTime = (ev) => {
    this.setState({timeString: ev.target.value})
  }

  onChangeTime2 = (ev) => {
    this.setState({time2String: ev.target.value})
  }

  onChangeSummary = (ev) => {
    this.setState({summaryString: ev.target.value})
  }

  generate = () => {
    const { dateString, timeString, time2String, summaryString } = this.state

    const icsString =
      `BEGIN:VCALENDAR\n` +
      `VERSION:2.0\n` +
      `PRODID:-//xroom.app//xroom.app follow-up plugin//EN\n` +
      `CALSCALE:GREGORIAN\n` +
      `BEGIN:VEVENT\n` +
      `SUMMARY:${summaryString}\n` +
      `DTSTAMP;TZID=${timeZone}:${toICalTime(new Date)}\n` +
      `UID:${uuidv4()}\n` +
      `DTSTART;TZID=${timeZone}:${dateString.replace(/-/g, '')}T${timeString.replace(':', '')}00\n` +
      `DTEND;TZID=${timeZone}:${dateString.replace(/-/g, '')}T${time2String.replace(':', '')}00\n` +
      `URL:https://xroom.app/${this.props.roomId}\n` +
      `STATUS:CONFIRMED\n` +
      `SEQUENCE:0\n` +
      `END:VEVENT\n` +
      `END:VCALENDAR\n`

    const blob = new Blob([icsString], {type: 'text/calendar'})
    this.setState({icsUrl: window.URL.createObjectURL(blob), icsBlob: blob})
  }

  share = () => {
    if (!this.state.inDaChat) {
      this.props.mbox({text: this.props.i18n.t('getIntoRoom')})
    } else {
      this.props.api('sendMessage', {
        type: 'file', to: 'all',
        content: new File([this.state.icsBlob], 'meeting.ics', {type: 'text/calendar'}),
      })
    }
  }

  onRoomEnter = () => {
    this.setState({inDaChat: true})
  }

  onRoomExit = () => {
    this.setState({inDaChat: false})
  }

  render () {
    const { i18n, ui } = this.props
    const { dateString, timeString, time2String, icsUrl, summaryString } = this.state
    const { Dialog, Button, TextInput } = ui

    return (
      <Dialog bgClose ref={ref => this.dialog = ref}>
        <h4 style={styles.header} dangerouslySetInnerHTML={{__html: i18n.t('header')}} />
        <div style={styles.inputRows}>
          <div style={styles.inputRow} >
            <span>{ i18n.t('theDate') }</span>
            <input style={styles.input} type="date" value={dateString} onChange={this.onChangeDate}/>
          </div>
          <div style={{...styles.inputRow, margin: '4px 0'}}>
            <span>{ i18n.t('fromTime') }</span>
            <input style={styles.input} type="time" value={timeString} onChange={this.onChangeTime} />
          </div>
          <div style={styles.inputRow}>
            <span>{ i18n.t('toTime') }</span>
            <input style={styles.input} type="time" value={time2String} onChange={this.onChangeTime2} />
          </div>
          <div style={styles.inputRow}>
            <span>{ i18n.t('summary') }</span>
            <TextInput style={styles.textInput} value={summaryString} onChange={this.onChangeSummary}/>
          </div>
        </div>
        <div>
          <Button primary onClick={this.generate}>{ i18n.t('btnGenerate') }</Button>
          {
            !!icsUrl &&
              <Fragment>
                <a href={icsUrl} download="meeting.ics" className="button secondary">{ i18n.t('btnDownload') }</a>
                <Button secondary onClick={this.share}>{ i18n.t('btnShare') }</Button>
              </Fragment>
          }
        </div>
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
    background: '#fff',
    minWidth: '480px',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    borderRadius: '4px',
  },
  header: {
    textAlign: 'center',
    margin: '8px 0 24px',
  },
  inputRows: {
    marginBottom: '16px',
  },
  inputRow: {
    textAlign: 'right',
  },
  input: {
    fontSize: '20px',
    padding: '4px 0',
    width: '150px',
    textAlign: 'center',
    marginLeft: '8px',
  },
  textInput: {
    marginTop: '4px',
    marginLeft: '8px',
    fontSize: '20px',
  },
}

export default UI
