import express from 'express'
import bodyParser from 'body-parser'
import { users } from './routes'
import { validationErrorHandler, uncaughtErrorHandler } from './error-handlers'
import './pre-start' 

const app = express()
  .use(bodyParser.json({ type: 'application/json' }))
  .use(users.route, users)
  .use(validationErrorHandler)
  .use(uncaughtErrorHandler)
  .get('/', (req, res) => res.send('Hello World! \o/'))
  .listen(3000, () => console.log('App started on port 3000'))
