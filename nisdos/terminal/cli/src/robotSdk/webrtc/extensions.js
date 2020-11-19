const
  { getRtcExchanger, getRtcPcCreator, removePeer } = require('./webrtc'),
  transportEvents = require('../transport/transport').events,
  transportEventSystem = require('../transport/transport').eventSystem,
  { getId } = require('../transport/transport')

// SECTION Extensions

/**
 * @param {RTCConfiguration} RTCConfig
 */
function enableExchangeListener (RTCConfig) {
  transportEventSystem.on(transportEvents.joinedRoom, ({ commands }) => {
    transportEventSystem.on(transportEvents.exchangeRequest, (data) => {
      getRtcExchanger(commands, RTCConfig)(data)
    })
  })
}

/**
 * @param {RTCConfiguration} RTCConfig
 */
function enablePeerUpdateListener (RTCConfig) {
  transportEventSystem.on(transportEvents.joinedRoom, ({ commands }) => {
    transportEventSystem.on(transportEvents.peerUpdated, data => {
      getRtcPcCreator(commands, RTCConfig)(data, getId())
    })
  })
}

function enablePeerRemoveListener () {
  transportEventSystem.on(transportEvents.peerRemoved, ({ peerId }) => removePeer(peerId))
}

// SECTION Exports

module.exports = { enableExchangeListener, enablePeerUpdateListener, enablePeerRemoveListener }
