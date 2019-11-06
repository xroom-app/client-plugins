const WebSocket = require('ws')

/**
 * Transport wrapper for socket.io
 */
class Transport {

  /**
   * @param roomName
   * @param onData
   */
  constructor(roomName, {onData}) {
    // this.ws = new WebSocket('http://localhost:4000/socket.io/?EIO=3&transport=websocket')
    this.ws = new WebSocket('https://signal.xroom.app:443/socket.io/?EIO=3&transport=websocket')

    this.ws.on('open', () => {
      this.ws.send(Transport.ioEncode('join', {'v': 1, 'room': `xroom.app/${roomName}`, 'type': 1, 'isHost': false, 'key': null}))

      // keep the connection alive
      setInterval(() => { this.ws.send('2') }, 20000)
    })

    this.ws.on('message', async (data) => {
      onData(Transport.ioDecode(data))
    })
  }

  /**
   * @param cmd
   * @param payload
   */
  send(cmd, payload) {
    this.ws.send(Transport.ioEncode(cmd, payload))
  }

  /**
   * @param cmd
   * @param payload
   * @returns {string}
   */
  static ioEncode(cmd, payload) {
    return `420${JSON.stringify([cmd, payload])}`
  }

  /**
   * @param data
   * @returns {any|{raw: *}}
   */
  static ioDecode(data) {
    const
      i1 = data.indexOf('['),
      i2 = data.indexOf('{')

    if (i1 === -1 && i2 === -1) {
      return { raw: data }
    }

    if (i1 !== -1 && i2 !== -1) {
      return JSON.parse(data.substring(Math.min(i1, i2)))
    }

    return JSON.parse(data.substring(i1 === -1 ? i2 : i1))
  }
}

module.exports = Transport
