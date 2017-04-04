require('./precheck')

const config = require('./config/server')
const server = require('./server')
const setup = require('./setup')

setup().then(() => server.listen(config.port, () => console.log(`Server started on port ${config.port}`)))
