import React, { Component } from 'react'

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      peers: [],
      splitCount: 2,
      isShown: false,
    }

    this.roomId = null
    this.toggle = this.toggle.bind(this)
    this.listPeers = this.listPeers.bind(this)
  }

  toggle () {
    this.setState({isShown: !this.state.isShown})
  }

  listPeers (peers) {
    peers.unshift({
      id: 'self',
      card: { name: this.props.i18n.t('you') },
    })
    this.setState({peers})
  }

  onSplitCountChanged = (ev) => {
    this.setState({splitCount: ev.target.value})
  }

  onSplit = () => {
    const
      newRooms = [],
      { api, i18n, mbox } = this.props,
      { peers, splitCount } = this.state

    if (peers.length < splitCount) {
      mbox({text: i18n.t('mbox.tooFewPeople')})
      return
    }

    // prepare room lists
    for (let n = 0; n < splitCount; n++) newRooms.push([])

    for (let n = 0; n < peers.length; n++) {
      newRooms[n % splitCount].push(peers[n].id)
    }

    // separate algorithms for further use

    for (const r in newRooms) {
      const suffix = String(Math.random()).slice(2, 8)

      for (const peerId of newRooms[r]) {
        api('sendMessage', {to: peerId, message: `${i18n.t('breakRoomOffer')} ${this.roomId}-${suffix}`})
      }
    }

    this.toggle()
  }

  render () {
    const { i18n } = this.props
    const { isShown, peers } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.dialog}>

        <fieldset style={styles.peerRows}>
          <legend>{ i18n.t('robots') }</legend>
          {
            peers.filter(p => p.isRobot).map((el, i) => {
              return (
                <div style={styles.peerRow} key={i}>
                  <span>{ i + 1 }.</span>
                  <span style={styles.peerName}>{ el.card.name }</span>
                </div>
              )
            })
          }
        </fieldset>

        <fieldset style={styles.peerRows}>
          <legend>{ i18n.t('humans') }</legend>
          {
            peers.filter(p => !p.isRobot).map((el, i) => {
              return (
                <div style={styles.peerRow} key={i}>
                  <span>{ i + 1 }.</span>
                  <span style={styles.peerName}>{ el.card.name }</span>
                </div>
              )
            })
          }
        </fieldset>

        <div style={styles.split}>
          <button style={styles.splitButton} onClick={this.onSplit}>
            { i18n.t('btnSplitRoom') }
          </button>
          <span style={styles.splitCountSpan}>{ i18n.t('splitOn') }</span>
          <input
            type="number"
            style={styles.splitCount}
            defaultValue={2}
            min={2}
            onChange={this.onSplitCountChanged}
          />
        </div>

      </div>
    )
  }
}

const styles = {
  dialog: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '260px',
    height: '100vh',
    background: 'rgba(40, 40, 40, .7)',
    color: '#fff',
    padding: '8px',
    fontSize: '14px',
    overflowY: 'auto',
  },
  peerRows: {
    border: '1px solid #fff',
    borderRadius: '4px',
    marginBottom: '16px',
    minHeight: '33px',
  },
  peerRow: {

  },
  peerName: {
    marginLeft: '8px',
  },
  split: {
    textAlign: 'center',
  },
  splitButton: {
    height: '30px',
    cursor: 'pointer',
  },
  splitCount: {
    width: '40px',
    height: '28px',
  },
  splitCountSpan: {
    margin: '0 8px',
  },
}

export default UI
