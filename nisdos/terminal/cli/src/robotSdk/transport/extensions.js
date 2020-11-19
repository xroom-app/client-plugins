const { events, eventSystem } = require('./transport')

// SECTION Extensions

function enableTransportLogging () {
  eventSystem.on(events.handshakeCompleted, () => console.log('Handshake with signal server completed'))
  eventSystem.on(events.joinedRoom, ({ roomId }) => console.log(`Joined room ${roomId}`))
  eventSystem.on(events.peerUpdated, (data) => console.log('Peer updated, new data: ', data))
  eventSystem.on(events.peerRemoved, ({ peerId }) => console.log(`Removed peer with id ${peerId}`))
  eventSystem.on(events.roomRead, (data) => console.log('Room was read, its data: ', data))
  // eventSystem.on(events.exchangeRequest, (data) => console.log('Exchange was requested: ', data))
  eventSystem.on(events.kickedFromRoom, ({ kickerId }) => console.log('Kicked from room', kickerId ? ` by ${kickerId}` : ''))
  eventSystem.on(events.roomRemoved, ({ roomId }) => console.log(`Room removed ${roomId}`))
  eventSystem.on(events.roomDestroyed, ({ roomId }) => console.log(`Room destroyed ${roomId}`))
}

// SECTION Exports

module.exports = { enableTransportLogging }
