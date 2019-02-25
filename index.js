const http = require('http')
const pingService = require('./services/pingService')
const serverInstanceService = require('./services/serverInstanceService')

let activeServerInstance = null

const server = http.createServer((serverReq, serverRes) => {
  while (serverInstanceService.checkIfRunningServers(activeServerInstance)) {
    try {
      pingService.ping(activeServerInstance.containerName)
      serverRes.writeHead(302, {
        'Location': activeServerInstance.containerName
      })
      
      activeServerInstance.resetServerInstanceProperties()
      activeServerInstance = serverInstanceService.changeActiveServerInstance(activeServerInstance)
      
      console.log('Sending redirection response to', serverReq.headers.host)
      return serverRes.end()
    } catch (error) {
      console.log(serverReq.headers.host.split(':')[0])
      activeServerInstance.markServerInstanceAsUnavailable()
      activeServerInstance = serverInstanceService.changeActiveServerInstance(activeServerInstance)
      console.log(error.toString())
    }
  }

  serverRes.writeHead(503, { 'Content-Type': 'application/json' })
  serverRes.write(JSON.stringify({ error: 'Service currently unavailable. Please try again later.' }))
  return serverRes.end()
})

server.listen(3000, () => {
  if (process.argv.length < 3) {
    console.log('Command line args missing! 3 args need to be given. First argument needs to',
      'specify the number of servers to be balanced. Second argument is the host name of servers',
      'without the id of the server.')
    process.exit(1)
  }

  activeServerInstance = serverInstanceService.formInitialListOfRunningServers(process.argv[2], process.argv[3], process.argv[4])

  console.log(activeServerInstance)
  console.log('Server listening on port 3000');
})
