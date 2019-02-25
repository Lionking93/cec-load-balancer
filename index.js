const http = require('http')
const configService = require('./services/configService')
const serverInstanceService = require('./services/serverInstanceService')

let config = null

const server = http.createServer((serverReq, serverRes) => {
  if (!serverInstanceService.checkIfActiveServerInstances()) {
    serverRes.writeHead(503, { 'Content-Type': 'application/json' })
    serverRes.write(JSON.stringify({ error: 'Service currently unavailable. Please try again later.' }))
    return serverRes.end()
  }

  serverInstanceService.changeActiveServerInstance()

  let redirectionLocation = config.redirectionTarget + ':' + serverInstanceService.getActiveServerInstance().port

  serverRes.writeHead(302, {
    'Location': redirectionLocation
  })

  console.log('Sending redirection to location', redirectionLocation)
  return serverRes.end()
})

server.listen(3000, async () => {
  if (process.argv.length < 3) {
    console.log('Command line args missing! You need to specify the path of the load balancer config file.')
    process.exit(1)
  }

  try {
    config = await configService.getConfig(process.argv[2])
    console.log('Load balancer config file contents', config)
    serverInstanceService.formInitialListOfRunningServers(config)
    console.log('Server listening on port 3000');
  } catch (error) {
    console.log('Failed to initialize server instances. Reason:', error)
    process.exit(1)
  }  
})
