function ServerInstance(containerName, port, nextServerInstance) {
  this.containerName = containerName
  this.port = port
  this.status = 'running'
  this.requestsUntilNextPoll = 0
  this.nextServerInstance = nextServerInstance
  this.numberOfUnsuccessfulPolls = 0

  this.resetServerInstanceProperties = () => {
    this.numberOfUnsuccessfulPolls = 0
    this.requestsUntilNextPoll = 0
    this.status = 'running'
  }

  this.markServerInstanceAsUnavailable = () => {
    this.status = 'unavailable'
    this.requestsUntilNextPoll = 10 * this.numberOfUnsuccessfulPolls + 10
    this.numberOfUnsuccessfulPolls += 1 
  }

  this.updatePollingStatus = () => {
    if (this.requestsUntilNextPoll > 0)
      this.requestsUntilNextPoll -= 1

    if (this.requestsUntilNextPoll === 0)
      this.status = 'running'
  }
}

/**
 * Return value to be used as activeServerInstance
 * @param {*} initialNumberOfServers 
 * @param {*} containerBaseName 
 */
const formInitialListOfRunningServers = (initialNumberOfServers, containerBaseName, portBasePart) => {
  const firstServerInstance = new ServerInstance(containerBaseName + '1', portBasePart + '1', null)
  let currentServerInstance = firstServerInstance

  for (let i = 2; i <= initialNumberOfServers; i++) {
    let newServerInstance =  new ServerInstance(containerBaseName + i, portBasePart + i, null)
    currentServerInstance.nextServerInstance = newServerInstance
    currentServerInstance = newServerInstance

    if (i == initialNumberOfServers) {
      currentServerInstance.nextServerInstance = firstServerInstance
    }
  }

  return firstServerInstance
}

const checkIfRunningServers = (activeServerInstance) => {
  let currentServerInstance = activeServerInstance
  
  if (currentServerInstance.status === 'running') {
    console.log('First server is active!')
    return true
  } else if (currentServerInstance.status === 'unavailable') {
    currentServerInstance.updatePollingStatus()
  }

  if (currentServerInstance.nextServerInstance !== null)
    currentServerInstance = currentServerInstance.nextServerInstance

  while (currentServerInstance != activeServerInstance) {
    console.log('Looking for active servers')
    if (currentServerInstance.status === 'running') {
      console.log('Found active server')
      return true
    } else if (currentServerInstance.status === 'unavailable') {
      currentServerInstance.updatePollingStatus()
    } 
    currentServerInstance = currentServerInstance.nextServerInstance
  }
  console.log('No active servers found')
  return false
}

const changeActiveServerInstance = (activeServerInstance) => {
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

  console.log('Active server instance:', activeServerInstance)
  return activeServerInstance
}

module.exports = {
  formInitialListOfRunningServers,
  changeActiveServerInstance,
  checkIfRunningServers
}