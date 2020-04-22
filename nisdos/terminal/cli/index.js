const BackendNode = require('./backendNode')
const Shell = require('./shell')

const SS_URL = 'http://localhost:4010'
// const SS_URL = 'https://signal.xroom.app:443'

if (process.argv.length < 3) {
  console.log('Usage: ./terminal [ROOM NAME]\n\n')
  process.exit(0)
}

const args = process.argv.slice(2)

console.log(`Connecting to room ${args[0]}...`)

const
  shell = new Shell(),
  bn = new BackendNode(SS_URL, {
    onSetId: () => bn.joinRoom(args[0]),
    onDataChannel: (chId, input) => {
      // console.log('stdin', input)
      if (input.cmd === 'line') {
        shell.write(`${input.args[0]}\n`)
      }
      if (input.cmd === 'key') {
        shell.write(input.args[0])
      }
      if (input.cmd === 'init') {
        bn.rtcDataSend(3, null, {cmd: 'init-ok', pluginId: 'nisdos/terminal'})
      }
    }
  })

shell.init({
  sendData: (data) => {
    console.log(data)
    bn.rtcDataSend(3, null, {cmd: 'line', args: [data], pluginId: 'nisdos/terminal'})
  }
})
