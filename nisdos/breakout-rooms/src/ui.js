import * as React from 'preact'
import Delete from './delete'
import styles from './style.module.css'

class UI extends React.Component {
	constructor(props) {
		super(props)

    this.dialog = null
    this.state = {
      peers: {},
      peerId: '',
      splitCount: 0,
      rooms: [],
      unassigned: [],
      currentRoom: 'free',
      draggableItem: {
        roomId: null,
        peerIndex: null,
      },
      invitationSent: false,
    }
    this.changeRoomCount = this.changeRoomCount.bind(this)
	}

  open() {
    this.dialog.toggle()
  }

  invitePeers () {
    this.props.api('suggestPlugin', {force: true})
    this.props.mbox({text: 'Invitation sent out to your peers'})
    this.setState({invitationSent: true})
  }

  listPeers (list) {
    const { rooms, peerId } = this.state
    let peersInRooms = []

    const peers = {}

    if (peerId) {
      peers[peerId] = {
        card: { name: this.props.i18n.t('you') }
      }
    }

    for (const peer of list) {
      peers[peer.id] = peer
    }

    rooms.map(room => {
      room.peers = room.peers.filter(peer => Object.keys(peers).includes(peer))
      peersInRooms = peersInRooms.concat(room.peers)
    })

    const unassigned = Object.keys(peers).filter(peer => !peersInRooms.includes(peer))
    this.setState({peers, unassigned, rooms}, this.sendState)
  }

  addId = peerId => this.setState({peerId})

  renderPeerList(list, roomId, columns = 1) {
    const { peers } = this.state
    
    return (
      <fieldset
        // className="drop_target"
        className={styles.peerList}
        style={{gridTemplateColumns: 'repeat('+ columns + ', minmax(0, 1fr))'}}
      >
        {list.map((peer, peerIndex) => (
          <div
            className={styles.peerRow}
            draggable={true}
            onDragStart={evt => this.onDragStart(evt, peerIndex, roomId)}
            onDragEnd={this.onDragEnd}
            key={peerIndex}
          >
            <div className={"ava__face " + styles.peerIcon}>{peers[peer].card.name.slice(0, 2)}</div>
            <span className={styles.peerName}>
              {peers[peer].card.name}
            </span>
          </div>
        ))}
      </fieldset>
    )
  }

  changeRoomName = (evt, roomId) => {
    const { rooms } = this.state
    evt.stopImmediatePropagation()
    evt.stopPropagation()
    evt.preventDefault()

    rooms[roomId].name = evt.target.value

    this.setState({ rooms }, this.sendState)
  }

  renderRoom(room) {
    const { currentRoom } = this.state
    const { Button } = this.props.ui

    return (
      <div
        className={styles.room + " drop_target"}
        onDrop={evt => this.onDrop(evt, room.roomId)}
        onDragOver={evt => evt.preventDefault()}
        onDragEnter={evt => this.toggleDashedBorder(evt, true)}
        onDragLeave={evt => this.toggleDashedBorder(evt, false)}
      >
        <div className={styles.roomHeader}>
          <input
            className={styles.roomName}
            value={room.name}
            size={room.name.length - 1}
            onInput={evt => this.changeRoomName(evt, room.roomId)}
          />
          {/* <span className={styles.roomName}>{room.name}</span> */}
          <span className={styles.roomCount}>({room.peers.length} Participants)</span>
          <div className={styles.roomDelete} onClick={() => this.deleteRoom(room.roomId)}>
            <Delete />
          </div>
          {currentRoom === room.roomId
            ? this.renderButton(() => this.leave(room.roomId), "Leave")
            : this.renderButton(() => this.join(room.roomId), "Join")
          }
          {/* {currentRoom === room.roomId
            ? <Button
                secondary
                onClick={() => this.leave(room.roomId)}
              >
                Leave
              </Button>
            : <Button
                primary
                onClick={() => this.join(room.roomId)}
              >
                Join
              </Button>
            } */}
        </div>
        <div className={styles.roomPeers}>
          {this.renderPeerList(room.peers, room.roomId, 2)}
        </div>
      </div>
    )
  }

  changeRoomCount(evt) {
    let { splitCount, rooms, unassigned, currentRoom, peerId, invitationSent } = this.state
    const count = evt.target.value
    let diff = count - splitCount

    if (diff > 0) {
      for (let i = splitCount; i < count; i++) {
        rooms.push({
          roomId: +i,
          name: 'Room ' + (+i + 1),
          peers: [],
        })
      }
    }
    if (diff < 0) {
      const deletedRooms = rooms.splice(rooms.length + diff, rooms.length)
      for (const room of deletedRooms) {
        unassigned = [...unassigned, ...room.peers]
        if (room.peers.includes(peerId)) currentRoom = 'free'
      }
    }

    // rooms.length && !invitationSent && this.invitePeers()

    this.setState({splitCount: count, rooms, unassigned, currentRoom}, this.sendState)
  }

  onDragStart = (evt, peerIndex, roomId) => {
    this.setState({draggableItem: {roomId, peerIndex}})
    // this.togglePointerEvents(false)
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

  toggleDashedBorder = (evt, isOn) => {
    const element = evt.target.closest ? evt.target : evt.target.parentElement
    element.closest('.drop_target').classList.toggle(styles.drop_over, isOn)
  }

  onDrop = (evt, roomId) => {
    const { api, i18n } = this.props
    let { rooms, draggableItem, unassigned } = this.state

    const sourcePeers = draggableItem.roomId === 'free' ? unassigned : rooms[draggableItem.roomId].peers
    const destPeers = roomId === 'free' ? unassigned : rooms[roomId].peers
    
    const splice = sourcePeers.splice(draggableItem.peerIndex, 1)[0]
    destPeers.push(splice)
    this.setState({ rooms, draggableItem: {}, currentRoom: roomId }, this.sendState)
    this.togglePointerEvents(true)
    this.toggleDashedBorder(evt, false)

    // const suffix = String(Math.random()).slice(2, 8)
    // api('sendMessage', {type: 'text', to: splice, msg: `${i18n.t('breakRoomOffer')} ${this.roomId}-${suffix}`})
  }

  shuffle = () => {
    let { rooms, peers, peerId, currentRoom } = this.state
    let peersInRooms = Object.keys(peers)

    for (const room of rooms) {
      room.peers = []
    }

    while (peersInRooms.length > 0) {
      rooms.some((room, index) => {
        if (peersInRooms.length === 0) return true
        const random = Math.ceil(Math.random() * peersInRooms.length - 1)
        const peer = peersInRooms.splice(random, 1)
        room.peers = [...room.peers, ...peer]

        if (peer.includes(peerId)) currentRoom = index
      })
    }

    this.setState({unassigned: peersInRooms, rooms, currentRoom}, this.sendState)
  }

  unassignPeers = () => {
    let { rooms, peers } = this.state

    for (const room of rooms) {
      room.peers = []
    }

    this.setState({unassigned: Object.keys(peers), rooms, currentRoom: 'free'}, this.sendState)
  }

  join = (roomId) => {
    let { rooms, unassigned, currentRoom, peerId } = this.state

    if (currentRoom === 'free') {
      unassigned.splice(unassigned.indexOf(peerId), 1)
    } else {
      rooms[currentRoom].peers.splice(rooms[currentRoom].peers.indexOf(peerId), 1)
    }
    rooms[roomId].peers.push(peerId)

    this.setState({rooms, unassigned, currentRoom: roomId}, this.sendState)
  }

  leave = (roomId) => {
    let { rooms, unassigned, peerId } = this.state

    rooms[roomId].peers.splice(rooms[roomId].peers.indexOf(peerId), 1)
    unassigned.push(peerId)

    this.setState({rooms, unassigned, currentRoom: 'free'}, this.sendState)
  }

  deleteRoom = (roomId) => {
    let { rooms, unassigned, currentRoom, peerId, splitCount } = this.state

    if (rooms[roomId].peers.includes(peerId)) currentRoom = 'free'
    unassigned = unassigned.concat(rooms[roomId].peers)
    rooms.splice(roomId, 1)
    --splitCount

    this.setState({rooms, unassigned, currentRoom, splitCount}, this.sendState)
  }

  sendState = () =>{
    const { rooms, unassigned } = this.state
    this.props.api('sendData', {
      data: { rooms, unassigned },
    })
  }

  receiveState = ({ rooms, unassigned }) => {
    const { peerId } = this.state
    const currentRoom = rooms.reduce((acc, room) =>
      room.peers.includes(peerId) ? room.roomId : acc
    , 'free')
    this.setState({ rooms, unassigned, currentRoom })
  }

  renderButton = (onClick, label, gap = false) => 
    <button
      className="button secondary"
      onClick={onClick}
      style={`border-radius: 8px; --primary-color:#E04006; --text-color:#FFFFFF; --secondary-color:#FFFFFF; margin-left: ${gap ? '1.3rem' : '0'}`}
    >
      {label}
    </button>

  render() {
    const { splitCount, unassigned, rooms } = this.state
    const { i18n, ui } = this.props
    const { Button, Dialog } = ui
    const peersInRoomsCount = rooms.reduce((acc, room) => acc + room.peers.length, 0)

    return (
      <Dialog
        bgClose
        ref={ref => this.dialog = ref}
        style={{minWidth: '53.5rem', maxWidth: '53.5rem', maxHeight: '45rem'}}
        header={i18n.t('header')}
      >
        <div className={styles.content}>
          <div className={styles.rooms}>
            <div className={styles.controls}>
              <p className={styles.controlsHeader} dangerouslySetInnerHTML={{__html: i18n.t('number')}} />
              <div className={styles.controlsRow}>
                <input
                  type="number"
                  className={styles.controlsNumber}
                  value={splitCount}
                  onChange={this.changeRoomCount}
                />
                <div className={styles.flexRow}>
                  {rooms.length > 0
                    ? this.renderButton(this.shuffle, "Shuffle All")
                    : ''
                  }
                  {peersInRoomsCount
                    ? this.renderButton(this.unassignPeers, "Unassign All", true)
                    : ''
                  }
                  {/* {rooms.length > 0 ?
                    <Button
                      secondary
                      onClick={this.shuffle}
                    >
                      Shuffle All
                    </Button> : ''
                  }
                  {peersInRoomsCount ?
                    <Button
                      secondary
                      style={{marginLeft: '1.3rem'}}
                      onClick={this.unassignPeers}
                    >
                      Unassign All
                    </Button> : ''
                  } */}
                </div>
              </div>
              <div className={styles.flexRow}>
                <input type="checkbox" id="allowAssign"/>
                <label htmlFor="allowAssign">Allow participants to assign themselves</label>
              </div>
            </div>
            <div className={styles.roomsList}>
              {rooms.map(room => this.renderRoom(room))}
            </div>
          </div>
          <div
            className={styles.unassignedList + " drop_target"}
            onDrop={evt => this.onDrop(evt, 'free')}
            onDragOver={(evt) => evt.preventDefault()}
            onDragEnter={evt => this.toggleDashedBorder(evt, true)}
            onDragLeave={evt => this.toggleDashedBorder(evt, false)}
          >
            <div className={styles.unassignedListHeader}>
              <span dangerouslySetInnerHTML={{__html: i18n.t('unassigned')}} />
            </div>
            <div className={styles.unassignedListContent}>
              {unassigned.length
                ? this.renderPeerList(unassigned, 'free')
                : <p className={styles.unassignedListEmpty}>{i18n.t('noUnassigned')}</p>}
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}

export default UI
