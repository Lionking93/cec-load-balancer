const fs = require('fs')

const getConfig = (configFileLocation) => {
  return new Promise((resolve, reject) => {
    fs.readFile(configFileLocation, 'UTF-8', (err, data) => {
      if (err)
        reject(err)

      resolve(JSON.parse(data))
    })
  })
}

module.exports =  {
  getConfig
}