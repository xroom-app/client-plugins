const
  { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, nonstandard } = require('wrtc'),
  RTCVideoSource = nonstandard.RTCVideoSource,
  RTCConfig = {iceServers: [{urls: ['stun:stun.l.google.com:19302']}]}

class Rtc {

  peers = {}
  negDone = {}
  transport = null

  init({transport, onDataChannel}) {
    this.transport = transport
    this.onDataChannel = onDataChannel
  }

  createPC(socketId, isOffer) {
    const pc = new RTCPeerConnection(RTCConfig)
    pc.dataChannels = []

  /*  pc.onicecandidate = function (ev) {
      if (ev.candidate) {
        console.log('+', ev.candidate.candidate)
      }
    }*/

    pc.onnegotiationneeded = () => {
      if (isOffer && !this.negDone[socketId]) {
        this.negDone[socketId] = true
        this.createOffer(socketId)
      }
    }

    ;[0, 0, 0, 'plugins', 'aux'].forEach((chName, id) => {

      if (!chName) return

      const ch = pc.createDataChannel(chName, {negotiated: true, id})
      ch.onmessage = (event) => {
        let data = event.data
        try { data = JSON.parse(event.data) } catch (e) {}
        // console.log('INCOMING', chName, data)

        if (data.cmd === 'whoAreYou') {
          ch.send(JSON.stringify({cmd: 'whoAmI', card: {name: `${process.platform} shell`}}))
        }

        if (chName === 'plugins') {
          this.onDataChannel(data)
        }
      }

      ch.onopen = () => {
        if (chName === 'plugins') {
          ch.send(JSON.stringify({cmd: 'line', args: ['$ ']}))
        }
      }

      pc.dataChannels[id] = ch
    })

    const source = new RTCVideoSource()
    const track = source.createTrack()
    pc.addTrack(track)

    this.peers[socketId] = pc

    return pc
  }

  /**
   * @param data
   * @returns {Promise<void>}
   */
  async exchange(data) {
    let pc = {}
    const fromId = data.from

    if (this.peers[fromId]) {
      pc = this.peers[fromId]
    } else {
      pc = this.createPC(fromId, false)
    }

    if (data.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      if (pc.remoteDescription.type === 'offer') {
        const desc = await pc.createAnswer()
        await pc.setLocalDescription(desc)
        this.transport.send('exchange', { v: 1, to: fromId, sdp: pc.localDescription })
      }
    } else {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
  }

  /**
   * @param socketId
   * @returns {Promise<void>}
   */
  async createOffer(socketId) {
    const
      pc = this.peers[socketId],
      desc = await pc.createOffer()

    await pc.setLocalDescription(desc)
    this.transport.send('exchange', { v: 1, to: socketId, sdp: pc.localDescription })
  }

  async peerLeft(socketId) {
    if (this.peers[socketId]) {
      this.peers[socketId].close()
      delete this.peers[socketId]
    }
  }

  dataSend (chId, peerId, data) {

    if (typeof data !== 'string') {
      data = JSON.stringify(data)
    }

    if (typeof data !== 'string') {
      console.log('Data format must be String, ArrayBuffer or ArrayBufferView.', data)
      return
    }

    for (const i in this.peers) {
      if (peerId === null || i === peerId) {
        // console.log('DATA SENT', chId, peerId, data)
        this.peers[i].dataChannels[chId].send(data)
      }
    }
  }
}

module.exports = new Rtc()
