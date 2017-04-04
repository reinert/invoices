import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import { ErrorHandler } from './handlers'
import { userRouter } from './routers'

export default express()
  .use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  .use(helmet())
  .use(bodyParser.json({ type: 'application/json' }))
  .use('/users', userRouter)
  .use(ErrorHandler.getRouter())
  .get('/', (req, res) => res.send('Hello World! \\o/'))
