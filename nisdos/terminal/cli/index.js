const
  transportEvents = require('./src/robotSdk/transport/transport').events,
  transportEventSystem = require('./src/robotSdk/transport/transport').eventSystem,
  rtcEvents = require('./src/robotSdk/webrtc/webrtc').events,
  rtcEventSystem = require('./src/robotSdk/webrtc/webrtc').eventSystem,
  { rtcDataSend } = require('./src/robotSdk/webrtc/webrtc'),
  { connectToServer, getId } = require('./src/robotSdk/transport/transport'),
  { enableTransportLogging } = require('./src/robotSdk/transport/extensions'),
  { enableExchangeListener, enablePeerUpdateListener, enablePeerRemoveListener } = require('./src/robotSdk/webrtc/extensions')

const Shell = require('./shell')
const RTCConfig = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] }

if (process.argv.length < 4) {
  console.log('Usage: ./terminal [ROOM NAME] [KEY] (SIGNAL SERVER)\n\n')
  process.exit(0)
}

const args = process.argv.slice(2)

const roomName = args[0]
const roomKey = args[1]
const shell = new Shell()
const signalServerUrl = args[2] ? `https://${args[2]}` : 'http://localhost:4010'

console.log(`Connecting to room ${args[0]}, using server ${signalServerUrl}...`)

enableTransportLogging()
enableExchangeListener(RTCConfig)
enablePeerUpdateListener(RTCConfig)
enablePeerRemoveListener()

connectToServer({
  ssUrl: signalServerUrl,
  reconnectInterval: 1000,
  protoVersion: 5,
})

transportEventSystem.on(transportEvents.handshakeCompleted, ({ commands }) => {
  commands.readRoom(roomName)

  transportEventSystem.on(transportEvents.roomRead, (data) => {
    if (data.id !== null) {
      commands.robotJoin({
        roomId: roomName,
        robotId: 1,
        connectKey: roomKey,
        options: {
          removable: false,
          singleton: true,
        }
      })
    } else {
      setTimeout(() => {
        commands.readRoom(roomName)
      }, 3000)
    }
  })
})

transportEventSystem.on(transportEvents.joinedRoom, ({ commands }) => {
  commands.addRuleSet(getStrategy(getId()))
})

transportEventSystem.on(transportEvents.roomRemoved, () => {
  process.exit(0)
})

rtcEventSystem.on(rtcEvents.onDCOpen, ({ peerId, id }) => {
  if (id === 3) {
    setTimeout(() => rtcDataSend(3, peerId, {cmd: 'init-ok', pluginId: 'nisdos/terminal'}), 500)
  }
})

rtcEventSystem.on(rtcEvents.onDCMessage, ({ peerId, id, data }) => {
  if (id === 3) {
    switch (data.cmd) {
      case 'line':
        shell.write(`${data.args[0]}\n`)
        break

      case 'key':
        shell.write(data.args[0])
        break

      case 'init':
        if (id === 3) {
          setTimeout(() => rtcDataSend(3, peerId, {cmd: 'init-ok', pluginId: 'nisdos/terminal'}), 500)
        }
        break

      default:
    }
  }
})

shell.init({
  sendData: (data) => {
    console.log(data)
    rtcDataSend(3, null, { cmd: 'line', args: [data], pluginId: 'nisdos/terminal' })
  }
})

/**
 * All types of clients
 *
 * @type {{
 *   HOST:  1
 *   USER:  2
 *   ROBOT: 3
 * }}
 */
const ClientType = {
  HOST:  1,
  USER:  2,
  ROBOT: 3,
}

/**
 * Returns custom strategy to add on join
 *
 * @param {string} id id of client
 */
function getStrategy (id) {
  return [
    [
      [ClientType.HOST, ClientType.HOST], {
      data: true,
      audio: { in: false, out: false },
      video: { in: false, out: false },
    }
    ], [
      [ClientType.HOST, ClientType.USER], {
        data: true,
        audio: { in: false, out: false },
        video: { in: false, out: false },
      }
    ], [
      [ClientType.USER, ClientType.HOST], {
        data: true,
        audio: { in: false, out: false },
        video: { in: false, out: false },
      }
    ], [
      [id, ClientType.HOST], {
        data: true,
        audio: { in: false, out: false },
        video: { in: false, out: false },
      }
    ], [
      [ClientType.HOST, id], {
        data: true,
        audio: { in: false, out: false },
        video: { in: false, out: false },
      }
    ], [
      [id, ClientType.USER], {
        data: true,
        audio: { in: false, out: false },
        video: { in: false, out: false },
      }
    ], [
      [ClientType.USER, id], {
        data: true,
        audio: { in: false, out: false },
        video: { in: false, out: false },
      }
    ], [
      [id, ClientType.ROBOT], {
        data: true,
        audio: { in: false, out: false },
        video: { in: false, out: false },
      }
    ]
  ]
}
