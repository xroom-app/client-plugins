const
  { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('wrtc'),
  { createEvent, createEventSystem } = require('@xroom-app/pkg-events')
// SECTION Types

/**
 * @template T
 *
 * @typedef {import('@xroom-app/pkg-events').Event<T>} Event
 */

/**
 * @typedef {import('../transport/transport').RoomTransportCommands} RoomTransportCommands
 */

/**
 * @typedef {import('robotSdk/transport/transport').ExchangeData} ExchangeData
 */

/**
 * @typedef {import('robotSdk/transport/transport').PeerConnectionData} PeerConnectionData
 */

// SECTION State

/** @type {Map<string, RTCPeerConnection>} */
const peers = new Map()

// SECTION Events

/** WebRTC related events */
const events = {
  /** @type {Event<{ peerId: string, id: number, data: any }>} */
  onDCMessage: createEvent(),
  /** @type {Event<{ pc: RTCPeerConnection, isOffer: Boolean }>} */
  onPeerConnection: createEvent(),
  /** @type {Event<{ pc: RTCPeerConnection }>} */
  beforePeerRemoved: createEvent(),
  /** @type {Event<{ peerId: string, id: number }>} */
  onDCOpen: createEvent(),
}

/** WebRTC related event system */
const eventSystem = createEventSystem(Object.values(events))

// SECTION temporary

/**
 * @param {RoomTransportCommands} commands
 * @param {RTCConfiguration} RTCConfig
 *
 * @return {(peer: PeerConnectionData, id: string | undefined) => Promise<RTCPeerConnection>}
 */
function getRtcPcCreator (commands, RTCConfig) {
  return async (peer, id) => {
    const
      peerId = peer.peerId,
      pc = new RTCPeerConnection(RTCConfig),
      isOffer = id !== undefined && id > peerId

    pc.cfg = {
      data: peer.data,
      video: peer.video,
      audio: peer.audio,
    }

    pc.isRobot = peer.isRobot
    pc.dataChannels = []
    pc.id = peerId

    pc.onicecandidate = (event) => {
      // console.log('on ice candidate')
      if (event.candidate) {
        commands.exchange({
          to: peerId,
          candidates: [event.candidate]
        })
      }
    }

    pc.onnegotiationneeded = () => {
      if (isOffer) {
        getRtcOfferCreator(commands)(peerId).catch()
      }
    }

    [0, 0, 0, 'plugins', 'aux'].forEach((chName, id) => {
      if (!chName) { return }

      const ch = pc.createDataChannel(String(chName), { negotiated: true, id })

      ch.onmessage = (event) => {
        let data = event.data

        try { data = JSON.parse(event.data) } catch (e) { }
        // console.log('INCOMING', chName, data)

        if (data.cmd === 'whoAreYou') {
          ch.send(JSON.stringify({ cmd: 'whoAmI', card: { name: 'NodeSDK' } }))
        }

        eventSystem.emit(events.onDCMessage, { peerId, id, data })
      }

      if (chName === 'aux') {
        ch.addEventListener('open', () => {
          eventSystem.emit(events.onDCOpen, { peerId, id })
          ch.send(JSON.stringify({ cmd: 'whoAreYou' }))
        })
      }

      pc.dataChannels[id] = ch
    })

    /*const source = new RTCVideoSource()
    const track = source.createTrack()
    pc.addTrack(track)*/

    console.log('before offer')

    peers.set(peerId, pc)

    eventSystem.emit(events.onPeerConnection, { pc, isOffer })

    return pc
  }
}

/**
 * @param {RoomTransportCommands} commands
 * @param {RTCConfiguration} RTCConfig
 *
 * @returns {(data: ExchangeData) => Promise<void>}
 */
function getRtcExchanger (commands, RTCConfig) {
  return async (data) => {
    if (peers.has(data.peerId)) {
      const pc = peers.get(data.peerId)

      if (pc === undefined) { return }

      // @ts-ignore temporary
      if (data.sdp !== undefined) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        if (pc.remoteDescription && pc.remoteDescription.type === 'offer') {
          const desc = await pc.createAnswer()

          await pc.setLocalDescription(desc)

          // @ts-ignore temporary
          commands.exchange({ to: data.peerId, sdp: pc.localDescription })
        }
      } else {
        for (const c of data.candidates) {
          // eslint-disable-next-line no-await-in-loop
          await pc.addIceCandidate(new RTCIceCandidate(c)).catch(e => {
            console.log('Failure during addIceCandidate(): ' + e.name)
          })
        }
      }
    }
  }
}

/**
 * @param {RoomTransportCommands} commands
 *
 * @returns {(socketId: string) => Promise<void>}
 */
function getRtcOfferCreator (commands) {
  return async (socketId) => {
    const pc = peers.get(socketId)

    // console.log('PC', pc)

    if (pc) {
      const desc = await pc.createOffer()
      await pc.setLocalDescription(desc)

      commands.exchange({
        // @ts-ignore temporary
        sdp: pc.localDescription,
        to: socketId,
      })
    }
  }
}

/**
 * @param {string} socketId
 * @returns {Promise<void>}
 */
async function removePeer (socketId) {
  console.log('removePeer fired', socketId)

  const pc = peers.get(socketId)

  if (pc !== undefined) {
    eventSystem.emit(events.beforePeerRemoved, { pc })

    // TODO close data channels
    pc.close()
    peers.delete(socketId)
  }
}

/**
 * @param chId
 * @param peerId
 * @param data
 */
function rtcDataSend (chId, peerId, data) {
  const preparedData = typeof data !== 'string'
    ? JSON.stringify(data)
    : data

  if (typeof preparedData !== 'string') {
    console.log('Data format must be String, ArrayBuffer or ArrayBufferView.', preparedData)
    return
  }

  for (const i of peers.keys()) {
    if (peerId === null || i === peerId) {
      // console.log('DATA SENT', chId, peerId, data)
      const peer = peers.get(i)

      if (peer !== undefined) {
        // @ts-ignore temporary
        peer.dataChannels[chId].send(preparedData)
      }
    }
  }
}

// SECTION Accessors

/**
 * @return {Array<string>} list of peer ids
 */
function getPeerIds () {
  // CRITICAL add logic
  return Array.from(peers.keys())
}

// SECTION Exports

module.exports = {
  getPeerIds,
  getRtcPcCreator,
  getRtcExchanger,
  getRtcOfferCreator,
  removePeer,
  rtcDataSend,
  events,
  eventSystem
}
