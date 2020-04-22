const WebSocket = require('ws')
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate, nonstandard } = require('wrtc')

const
  PROTO_VERSION = 3,
  RTCVideoSource = nonstandard.RTCVideoSource,
  RTCConfig = {iceServers: [{urls: ['stun:stun.l.google.com:19302']}]}

class BackendNode {

  /**
   * @param {String} ssURL
   * @param {Object<Function>} hooks
   */
  constructor(ssURL, hooks = {}) {
    this.id = null
    /**
     * @type {Object<Function>}
     */
    this.peers = {}
    this.negDone = {}
    this.ssURL = ssURL
    this.hooks = hooks
    this.roomId = null
    this.initSocket ()
  }

  initSocket () {
    delete this.ws
    this.ws = new WebSocket(this.ssURL)

    this.ws.on('open', () => {
      if (this.id) {
        this.send('reconnect', {id: this.id, roomId: this.roomId, peerIds: Object.keys(this.peers)} )
      } else {
        this.send('requestId')
      }
    })

    this.ws.on('close', () => {
      setTimeout(() => {
        console.log('RECONNECTING...')
        this.initSocket()
      }, 5000)
    })

    this.ws.on('message', (data) => {
      if (data === 'ping') {
        this._send('pong')
      } else {
        try {
          const json = JSON.parse(data)
          this.handleMessage(json).catch()
        } catch (e) {
          console.log('General error', e)
        }
      }
    })

    this.ws.on('error', (err) => {
      console.log('WS', err)
    })
  }

  /**
   * @param cmd
   * @param data
   * @param reqId
   */
  send (cmd, data, reqId = null) {
    if (!reqId) {
      reqId = String(Math.random())
    }
    this._send(JSON.stringify({cmd, v: PROTO_VERSION, data, reqId}))
  }

  /**
   * Internal sender abstraction
   *
   * @param what
   */
  _send (what) {
    this.ws.send(what, {
      compress: true,
      binary: false,
      fin: true,
      mask: true,
    }, null)
  }

  /**
   * Hook invocation helper
   *
   * @param name
   * @param args
   */
  hook (name, ...args) {
    this.hooks[name] && this.hooks[name](...args)
  }

  /**
   * @param reqId
   * @param cmds
   */
  async handleMessage ({reqId, cmds}) {
    for (const cmd of cmds) {
      // console.log(`* ${cmd[0]}`, cmd[1])

      switch (cmd[0]) {
        case 'setId':
          this.id = cmd[1]
          this.hook('onSetId')
          break

        case 'onJoin':
          const { status, roomId } = cmd[1]
          if (status === 1) {
            this.roomId = roomId
          }
          this.hook('onJoin', status, roomId)
          break

        case 'exchange':
          const { peerData, ...otherData } = cmd[1]

          const options = {
            peerId: peerData[0],
            data: !!peerData[1],
            audio: { in: !!peerData[2], out: !!peerData[3] },
            video: { in: !!peerData[4], out: !!peerData[5] },
            ...otherData
          }

          await this.rtcExchange(options)
          break

        case 'updatePeers':
          const { s, r } = cmd[1] || {}

          for (const set of s) {
            // for now we only care about IDs
            this.rtcCreatePC({
              peerId: set[0],
              data: set[1],
              audio: {
                in: set[2],
                out: set[3],
              },
              video: {
                in: set[4],
                out: set[5],
              },
            }, true)
          }

          for (const id of r) {
            this.rtcPeerLeft(id)
          }
          break

        default:
      }
    }
  }

  joinRoom (roomId) {
    this.send('join', {roomId})
  }

  leaveRoom () {

  }


  // ====== WebRTC level ======

  rtcCreatePC(peer, isOffer) {
    const
      socketId = peer.peerId,
      pc = new RTCPeerConnection(RTCConfig)

    pc.dataChannels = []

    pc.onicecandidate = (event) => {
      // console.log('on ice candidate')
      if (event.candidate) {
        this.send('exchange', {
          to: socketId,
          candidate: event.candidate
        })
      }
    }

    pc.onnegotiationneeded = () => {
      if (isOffer && !this.negDone[socketId]) {
        this.negDone[socketId] = true
        this.rtcCreateOffer(socketId).catch()
      }
    }

    pc.ontrack = (event) => {
      console.log('onTrack', event)
    }

    ;[0, 0, 0, 'plugins', 'aux'].forEach((chName, id) => {

      if (!chName) return

      const ch = pc.createDataChannel(chName, {negotiated: true, id})
      ch.onmessage = (event) => {
        let data = event.data
        try { data = JSON.parse(event.data) } catch (e) {}
        // console.log('INCOMING', chName, data)

        if (data.cmd === 'whoAreYou') {
          ch.send(JSON.stringify({cmd: 'whoAmI', card: {name: "Smile, you're on Facebook"}}))
        }

        this.hook('onDataChannel', id, data)
      }

      ch.onopen = () => {
        if (chName === 'plugins') {
          ch.send(JSON.stringify({cmd: 'line', args: ['$ ']}))
        }
      }

      pc.dataChannels[id] = ch
    })

    /*const source = new RTCVideoSource()
    const track = source.createTrack()
    pc.addTrack(track)*/

    console.log('before offer')
    this.hook('beforeOffer', pc)

    this.peers[socketId] = pc

    return pc
  }

  /**
   * @param data
   * @returns {Promise<void>}
   */
  async rtcExchange(data) {
    let pc

    if (this.peers[data.peerId]) {
      pc = this.peers[data.peerId]
    } else {
      pc = this.rtcCreatePC(data, false)
    }

    if (data.sdp) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
      if (pc.remoteDescription.type === 'offer') {
        const desc = await pc.createAnswer()
        await pc.setLocalDescription(desc)
        this.send('exchange', { to: data.peerId, sdp: pc.localDescription })
      }
    } else {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate))
    }
  }

  /**
   * @param socketId
   * @returns {Promise<void>}
   */
  async rtcCreateOffer(socketId) {
    const pc = this.peers[socketId]

    console.log('PC', pc)

    if (pc) {
      const desc = await pc.createOffer()
      await pc.setLocalDescription(desc)
      this.send('exchange', {
        sdp: pc.localDescription,
        to: socketId,
      })
    }
  }

  /**
   * @param socketId
   * @returns {Promise<void>}
   */
  async rtcPeerLeft(socketId) {
    this.hook('beforePeerLeft', this.peers[socketId] || null)
    if (this.peers[socketId]) {
      this.peers[socketId].close()
      delete this.peers[socketId]
      delete this.negDone[socketId]
    }
  }

  /**
   * @param chId
   * @param peerId
   * @param data
   */
  rtcDataSend (chId, peerId, data) {
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

module.exports = BackendNode
