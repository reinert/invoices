require('./precheck')

const server = require('./server')
const setup = require('./setup')

const serverConfigPath = process.env.SERVER_CONFIG || './server/config'
const config = require(serverConfigPath)

setup()
  .then(() => {
    server.listen(
      config.port, () => console.log(`Server started on port ${config.port}`))
  })
