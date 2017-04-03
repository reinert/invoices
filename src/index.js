import './setup'

import server from './express'

server.listen(3000, () => console.log('App started on port 3000'))
