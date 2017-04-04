const server = require('./server')
const setup = require('./setup')

setup().then(() => server.listen(3000, () => console.log('App started on port 3000')))
