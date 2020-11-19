const { createEvent, createEventSystem } = require('@xroom-app/pkg-events')
const { getReconnectingSocket } = require('@xroom-app/pkg-reconnecting-socket')
const { getPeerIds } = require('../webrtc/webrtc')
const {
  getReconnectCommand,
  getRequestIdCommand,
  getRobotJoinCommand,
  getReadRoomCommand,
  getExchangeCommand,
  getLeaveCommand,
  getKickCommand,
  getSetLockCommand,
  getSetPasswordCommand,
  getResetPasswordCommand,
  getDestroyRoomCommand,
  getSetCapacityCommand,
  getAddRuleSetCommand,
} = require('./commands')

// SECTION Types

/**
 * @template T
 *
 * @typedef {import('@xroom-app/pkg-events').Event<T>} Event
 */

/** @typedef {import('child_process').Serializable} Serializable */

/**
 * Data to connect to the signal server
 *
 * @typedef {{
 *   ssUrl: string
 *   protoVersion: number
 *   reconnectInterval: number
 * }} ConnectData
 */

/**
 * @typedef {{
 *   roomId: string
 *   connectKey: string
 * }} JoinData
 */

/**
 * Data about robot
 *
 * @typedef {{
 *   removable: boolean // Can't be removed until room removed
 *   singleton: boolean // Can't be duplicated in single room
 * }} RobotOptions
 */

/**
 * Used to send commands to the signal server
 *
 * @typedef {<T extends string>(
 *   command: T,
 *   data: Serializable,
 * ) => boolean} CommandSender
 */

/**
 * Data about peer connection
 *
 * @typedef {{
 *   peerId: string
 *   data: boolean
 *   audio: { in: boolean, out: boolean }
 *   video: { in: boolean, out: boolean }
 *   isRobot: boolean
 * }} PeerConnectionData
 */

/**
 * @typedef {{
 *   CONFERENCE: 1
 *   WEBINAR:    2
 * }} RoomType
 */

/**
 * Read room command result
 *
 * @typedef {{
 *  id: null
 * } | {
 *  id: string
 *  type: RoomType[keyof RoomType]
 *  peerCount: number
 *  humanCount: number
 *  robotCount: number
 *  hostCount: number
 *  capacity: number
 *  access: {
 *    lock: boolean
 *    password: boolean
 *  }
 * }} ReadRoomResult
 */

/**
 * Exchange data
 *
 * @typedef {{
 *   peerId: string
 * } & ({
 *   sdp: string
 * } | {
 *   candidates: Array<RTCIceCandidate>
 * })} ExchangeData
 */

/**
 * Basic transport commands
 *
 * @typedef {ReturnType<typeof getBasicTransportCommands>} BasicTransportCommands
 */

/**
 * Room transport commands
 *
 * @typedef {ReturnType<typeof getRoomTransportCommands>} RoomTransportCommands
 */

// SECTION State

/**
 * Id of signal server connection
 *
 * @type {string | undefined}
 */
let id

/**
 * Id of the room robot is connected
 *
 * @type {string | undefined}
 */
let roomId

// SECTION Events

/**
 * Transport level events
 */
const events = {
  /** @type {Event<{ commands: ReturnType<typeof getBasicTransportCommands> }>} */
  handshakeCompleted: createEvent(),
  /** @type {Event<{ roomId: string, commands: ReturnType<typeof getRoomTransportCommands> }>} */
  joinedRoom: createEvent(),
  /** @type {Event<PeerConnectionData>} */
  peerUpdated: createEvent(),
  /** @type {Event<{ peerId: string }>} */
  peerRemoved: createEvent(),
  /** @type {Event<ReadRoomResult>} */
  roomRead: createEvent(),
  /** @type {Event<ExchangeData>} */
  exchangeRequest: createEvent(),
  /** @type {Event<{ kickerId?: string }>} */
  kickedFromRoom: createEvent(),
  /** @type {Event<{ roomId: string }>} */
  roomRemoved: createEvent(),
  /** @type {Event<{ roomId: string }>} */
  roomDestroyed: createEvent(),
}

/**
 * Transport level event system
 */
const eventSystem = createEventSystem(Object.values(events))

// SECTION Utils

/**
 * Sends command to signal server
 *
 * @type {(
 *   protoVersion: number,
 *   getSocket: () => import('ws'),
 * ) => CommandSender
 * }
 */
function getCommandSender (protoVersion, getSocket) {
  return (cmd, data) => send(getSocket(), JSON.stringify({ cmd, v: protoVersion, data }))
}

/**
 * Returns function handles signal server message
 *
 * @param {CommandSender} send command sender
 *
 * @return {(data: { cmds: Array<[string, Serializable]> }) => void}
 */
function getMessageHandler (send) {
  const handleCommand = getCommandHandler(send)

  return (data) => data.cmds.forEach(
    ([command, data]) => handleCommand(command, data)
  )
}

/**
 * Returns function handles signal server command
 *
 * @param {CommandSender} send command sender
 *
 * @return {(command: string, data: Serializable) => void}
 */
function getCommandHandler (send) {
  // eslint-disable-next-line complexity
  return (command, data) => {
    switch (command) {
      case 'versionExpired':
        throw new Error('Protocol version expired, please upgrade your sdk')

      case 'serverError':
        throw new Error('Server error occurred, we already fixing it')

      case 'reconnectFailed':
        console.log('Reconnect failed, resetting state')
        roomId = undefined
        id = undefined
        break

      case 'setId':
        // @ts-ignore temporary
        id = data
        eventSystem.emit(events.handshakeCompleted, { commands: getBasicTransportCommands(send) })
        break

      case 'onJoin':
        // @ts-ignore temporary
        if (data.status !== 1) {
          // @ts-ignore temporary
          throw new Error(`Join failed with status ${data.status}`)
        }

        // @ts-ignore temporary
        roomId = data.roomId

        if (roomId !== undefined) {
          eventSystem.emit(events.joinedRoom, { roomId, commands: getRoomTransportCommands(send) })
        }
        break

      case 'updatePeers':
        // @ts-ignore temporary
        data.s
          .map(unpackPeerConnectionData)
          // @ts-ignore temporary
          .forEach(data => eventSystem.emit(events.peerUpdated, data))

        // @ts-ignore temporary
        data.r
          // @ts-ignore temporary
          .forEach(peerId => eventSystem.emit(events.peerRemoved, { peerId }))
        break

      case 'onReadRoom':
        // @ts-ignore temporary
        eventSystem.emit(events.roomRead, data)
        break

      case 'exchange':
        // @ts-ignore temporary
        eventSystem.emit(events.exchangeRequest, data)
        break

      case 'kick':
        // @ts-ignore temporary
        eventSystem.emit(events.kickedFromRoom, data ? { kickerId: data.peerId } : {})
        break

      case 'roomRemoved':
        // @ts-ignore temporary
        eventSystem.emit(events.roomRemoved, { roomId: data })
        break

      case 'roomDestroyed':
        // TODO Change to roomId came from server
        // @ts-ignore temporary
        eventSystem.emit(events.roomDestroyed, { roomId })
        break

      default:
    }
  }
}

/**
 * @param {CommandSender} send command sender
 */
function getBasicTransportCommands (send) {
  return {
    readRoom: getReadRoomCommand(send),
    robotJoin: getRobotJoinCommand(send),
  }
}

/**
 * @param {CommandSender} send command sender
 */
function getRoomTransportCommands (send) {
  return {
    exchange: getExchangeCommand(send),
    leave: getLeaveCommand(send),
    kick: getKickCommand(send),
    setLock: getSetLockCommand(send),
    setPassword: getSetPasswordCommand(send),
    resetPassword: getResetPasswordCommand(send),
    destroyRoom: getDestroyRoomCommand(send),
    setCapacity: getSetCapacityCommand(send),
    addRuleSet: getAddRuleSetCommand(send),
  }
}

/**
 * Unpacks peer connection data from signal server
 *
 * @param {[string, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1]} data peer data
 *
 * @return {PeerConnectionData} unpacked peer connection data
 */
function unpackPeerConnectionData (data) {
  return {
    peerId: data[0],
    data: Boolean(data[1]),
    audio: {
      in: Boolean(data[2]),
      out: Boolean(data[3])
    },
    video: {
      in: Boolean(data[4]),
      out: Boolean(data[5])
    },
    isRobot: Boolean(data[6])
  }
}

// SECTION Accessors

/**
 * Returns socket id
 *
 * @return {string | undefined} socket id
 */
function getId () {
  return id
}

// SECTION Commands

/**
 * Prepares socket to handle messages
 *
 * @param {() => import('ws')} getSocket lazy socket
 * @param {CommandSender} send command sender
 */
function prepareSocket (getSocket, send) {
  getSocket().on('open', () => {
    if (id !== undefined && roomId !== undefined) {
      getReconnectCommand(send)({ id, roomId, peerIds: getPeerIds() })
    } else {
      getRequestIdCommand(send)()
    }
  })

  getSocket().on('message', (data) => {
    if (data === 'ping') {
      getSocket().send('pong')

      return
    }

    try {
      const msg = JSON.parse(String(data))
      getMessageHandler(send)(msg)
    } catch (err) {
      console.log('General error', err)
    }
  })

  getSocket().on('error', (err) => {
    console.log('WS', err)
  })
}

/**
 * @param {ConnectData} connectData data to connect to signal server
 */
function connectToServer (connectData) {
  const
    { ssUrl, reconnectInterval } = connectData,
    getSocket = getReconnectingSocket(ssUrl, reconnectInterval),
    commandSender = getCommandSender(connectData.protoVersion, getSocket)

  prepareSocket(getSocket, commandSender)
}

// SECTION Tasks

/**
 * Sends message to signal server
 *
 * @param {import('ws')} socket socket to send
 * @param {string} msg message to send
 */
function send (socket, msg) {
  if (socket.readyState !== socket.OPEN) {
    return false
  }

  socket.send(msg, {
    compress: true,
    binary: false,
    fin: true,
    mask: true,
  })

  return true
}

// SECTION Exports

module.exports = { events, eventSystem, connectToServer, getId }
