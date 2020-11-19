const { spawn } = require('child_process')

class Shell {

  constructor(command) {
    this.sh = null
    this.command = command || process.platform === 'win32' ? 'cmd' : '/bin/sh'
  }

  init({command = null, sendData}) {
    this.sh = spawn(this.command)

    this.sh.stdin.resume()

    this.sh.stdout.on('data', function (data) {
      sendData(data.toString())
    })

    this.sh.stderr.on('data', function (data) {
      sendData(data.toString())
    })

    this.sh.on('close', function () {
      sendData('Bye-bye!')
    })
  }

  write(data) {
    this.sh.stdin.write(`${data}`)
  }
}

module.exports = Shell
