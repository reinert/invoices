import './setup'

import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import { UserResource } from './resources'
import { sequelizeValidationErrorHandler, headerValidationErrorHandler, uncaughtErrorHandler } from './error-handlers'

express()
  .use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  .use(bodyParser.json({ type: 'application/json' }))
  .use('/users', UserResource.getRouter())
  .use(sequelizeValidationErrorHandler)
  .use(headerValidationErrorHandler)
  .use(uncaughtErrorHandler)
  .get('/', (req, res) => res.send('Hello World! \\o/'))
  .listen(3000, () => console.log('App started on port 3000'))
