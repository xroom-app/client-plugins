import React, { Component } from 'react'

class UI extends Component {

  constructor(props) {
    super(props)

    this.state = {
      peers: [],
      splitCount: 2,
      isShown: false,
      tempRooms: [],
      draggableItem: {
        roomId: '',
        peerIndex: '',
      },
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
      { i18n, mbox } = this.props,
      { peers, splitCount } = this.state

    if (peers.length < splitCount) {
      mbox({text: i18n.t('mbox.tooFewPeople')})
      return
    }

    // prepare room lists
    for (let n = 0; n < splitCount; n++) newRooms.push([])

    for (let n = 0; n < peers.length; n++) {
      newRooms[n % splitCount].push(peers[n])
    }

    this.setState({tempRooms: newRooms})
  }

  onDragStart = (evt, peerIndex, roomId) => {
    this.setState({draggableItem: {roomId, peerIndex}})
    this.togglePointerEvents(false)
    evt.target.style.opacity = 0.5
  }
  
  onDragEnd = evt => {
    this.togglePointerEvents(true)
    evt.target.style.opacity = 1
  }

  togglePointerEvents = isOn =>
    document.querySelectorAll('.peer_row').forEach(el =>
      el.style.pointerEvents = isOn ? 'auto' : 'none'
    )

  toggleDashedBorder = (evt, isOn) => evt.target.closest('fieldset').style.borderStyle = isOn ? 'dashed' : 'solid'

  onDrop = (evt, roomId) => {
    let { tempRooms, draggableItem } = this.state

    const splice = tempRooms[draggableItem.roomId].splice(draggableItem.peerIndex, 1)
    tempRooms[roomId].push(splice[0])
    this.setState({ tempRooms, draggableItem: {} })
    this.togglePointerEvents(true)
    this.toggleDashedBorder(evt, false)
  }

  confirmSplit = () => {
    const { api, i18n } = this.props
    for (const r in this.state.tempRooms) {
      const suffix = String(Math.random()).slice(2, 8)

      for (const peer of this.state.tempRooms[r]) {
        api('sendMessage', {to: peer.id, message: `${i18n.t('breakRoomOffer')} ${this.roomId}-${suffix}`})
      }
    }

    this.toggle()
  }
  
  changeRoomCount = isAdding => this.setState({
      splitCount: isAdding ? ++this.state.splitCount : --this.state.splitCount
    }, this.onSplit)

  renderPeerList = (peers, isRobots = false, draggable = false, roomId = null) =>
    peers.filter(p => isRobots ^ !p.isRobot).length > 0 &&
      <fieldset
        style={styles.peerRows}
        onDrop={evt => this.onDrop(evt, roomId)}
        onDragEnter={evt => this.toggleDashedBorder(evt, true)}
        onDragLeave={evt => this.toggleDashedBorder(evt, false)}
      >
        <legend>{ this.props.i18n.t(isRobots ? 'robots' : 'humans') } {roomId !== null && roomId + 1}</legend>
        {
          peers.filter(p => isRobots ^ !p.isRobot).map((el, peerIndex) => {
            return (
              <div
                draggable={draggable && peers.length > 1}
                onDragStart={evt => this.onDragStart(evt, peerIndex, roomId)}
                onDragEnd={this.onDragEnd}
                style={styles.peerRow}
                className="peer_row"
                key={peerIndex}
              >
                <span>{ peerIndex + 1 }.</span>
                <span style={styles.peerName}>{ el.card.name }</span>
              </div>
            )
          })
        }
      </fieldset>

  render () {
    const { i18n } = this.props
    const { isShown, peers, tempRooms } = this.state

    if (!isShown) {
      return null
    }

    return (
      <div style={styles.dialog}>

        {this.renderPeerList(peers, true)}

        {tempRooms.length > 0
          ? 
            <>
              {tempRooms.map((room, roomId) => this.renderPeerList(room, false, true, roomId))}
              <div style={styles.row}>
                <button style={styles.cancel} onClick={() => this.setState({tempRooms: []})}>
                { i18n.t('btnCancelSplitRoom') }
                </button>
                <button
                  style={styles.changeCountButton}
                  disabled={tempRooms.length < 3}
                  onClick={() => this.changeRoomCount(false)}
                >-</button>
                <button
                  style={styles.changeCountButton}
                  disabled={tempRooms.length === peers.length}
                  onClick={() => this.changeRoomCount(true)}
                >+</button>
              </div>
              <div style={styles.row}>
                <button style={styles.sendInviteButton} onClick={this.confirmSplit}>
                  { i18n.t('btnConfirmSplitRoom') }
                </button>
              </div>
            </>
          : 
            <>
              {this.renderPeerList(peers)}
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
                  max={peers.length}
                  onChange={this.onSplitCountChanged}
                />
              </div>
            </>
        }
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
    userSelect: 'none',
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
  row: {
    display: 'flex',
    marginBottom: 10,
  },
  cancel: {
    marginRight: 'auto',
  },
  changeCountButton: {
    marginLeft: 5,
  },
  sendInviteButton: {
    height: '30px',
    cursor: 'pointer',
    width: '100%',
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
