const exec = require('child_process').execSync

function ServerInstance(containerName, port, nextServerInstance) {
  this.containerName = containerName
  this.port = port
  this.status = 'running'
  this.nextServerInstance = nextServerInstance
}

const getActiveServerInstance = () => {
  console.log('Retrieving active server instance. Got:', activeServerInstance)
  return activeServerInstance
}

/**
 * Return value to be used as activeServerInstance
 * @param {*} initialNumberOfServers 
 * @param {*} containerBaseName 
 */
const formInitialListOfRunningServers = (config) => {
  const firstServerInstance = new ServerInstance(config.servers[0].containerName, config.servers[0].port, null)
  let currentServerInstance = firstServerInstance

  for (let i = 1; i < config.servers.length; i++) {
    let newServerInstance =  new ServerInstance(config.servers[i].containerName, config.servers[i].port, null)
    currentServerInstance.nextServerInstance = newServerInstance
    currentServerInstance = newServerInstance

    if (i === config.servers.length - 1) {
      currentServerInstance.nextServerInstance = firstServerInstance
    }
  }

  activeServerInstance = firstServerInstance
  console.log('Server instances initialized. New active server instance: ', activeServerInstance)
}

const checkIfServerInstanceIsActive = (serverInstance) => {
  try {
    exec(`ping -c 3 ${serverInstance.containerName}`)
    console.log(`Server ${serverInstance.containerName} is active!`)
    serverInstance.status = 'running'
    return true
  } catch (error) {
    console.log(`Server ${serverInstance.containerName} is not active!`)
    serverInstance.status = 'unavailable'
    return false
  }
}

const checkIfActiveServerInstances = () => {
  let currentServerInstance = activeServerInstance
  let activeServerInstanceFound = checkIfServerInstanceIsActive(currentServerInstance)

  if (currentServerInstance.nextServerInstance !== null)
    currentServerInstance = currentServerInstance.nextServerInstance

  while (currentServerInstance != activeServerInstance) {
    console.log('Looking for active servers')
    if (checkIfServerInstanceIsActive(currentServerInstance))
      activeServerInstanceFound = true
    currentServerInstance = currentServerInstance.nextServerInstance
  }
  console.log('No active servers found')
  return activeServerInstanceFound
}

const changeActiveServerInstance = () => {
  let currentServerInstance = activeServerInstance.nextServerInstance !== null 
    ? activeServerInstance.nextServerInstance
    : activeServerInstance

  while (currentServerInstance != activeServerInstance) {
    if (currentServerInstance.status === 'running') {
      activeServerInstance = currentServerInstance
      break
    } 
    currentServerInstance = currentServerInstance.nextServerInstance
  }

  console.log('Changed active serve instance. New active server instance:', activeServerInstance)
  return activeServerInstance
}

const serverInstanceService = () => {
  let activeServerInstance = null

  return {
    getActiveServerInstance,
    changeActiveServerInstance,
    checkIfActiveServerInstances,
    formInitialListOfRunningServers
  }
}

module.exports = serverInstanceService()