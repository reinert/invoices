import server from './express'
import setup from './setup'

setup().then(() => server.listen(3000, () => console.log('App started on port 3000')))
