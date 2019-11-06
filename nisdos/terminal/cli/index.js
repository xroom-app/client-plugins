const RTC = require('./rtc')
const Shell = require('./shell')
const Transport = require('./transport')

let mySocketId = null

const onTransportData = async (json) => {
  if (json[0] === 'exchange') {
    await RTC.exchange(json[1])
  }

  if (json[0] && json[0].reconnectSecret && json[0].socketIds) {
    for (const socketId of json[0].socketIds) {
      await RTC.createPC(socketId, true)
    }
  }

  if (json[0] && json[0].sid) {
    mySocketId = json[0].sid
  }

  if (json[0] === 'peer-left') {
    const id = json[1]

    if (id !== mySocketId) {
      await RTC.peerLeft(id)
    }
  }

  // console.log(json)
}

if (process.argv.length < 3) {
  console.log('Usage: ./terminal [ROOM NAME]\n\n')
  process.exit(0)
}

const args = process.argv.slice(2)

console.log(`Connecting to room ${args[0]}...`)

const
  shell = new Shell(),
  transport = new Transport(args[0], {onData: onTransportData})

shell.init({
  sendData: (data) => {
    console.log(data)
    RTC.dataSend(3, null, {cmd: 'line', args: [data], pluginId: 'nisdos/terminal'})
  }
})

RTC.init({
  transport,
  onDataChannel: (input) => {
    // console.log('stdin', input)
    if (input.cmd === 'line') {
      shell.write(`${input.args[0]}\n`)
    }
    if (input.cmd === 'key') {
      shell.write(input.args[0])
    }
    if (input.cmd === 'init') {
      RTC.dataSend(3, null, {cmd: 'init-ok', pluginId: 'nisdos/terminal'})
    }
  }
})
