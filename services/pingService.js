const exec = require('child_process').execSync

const ping = (host) => {
  return exec(`ping -c 3 ${host}`)
}

module.exports = {
  ping
}