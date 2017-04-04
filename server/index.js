const bodyParser = require('body-parser')
const ErrorHandler = require('./handlers').ErrorHandler
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const userRouter = require('./routers').userRouter

module.exports = express()
  .use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  .use(helmet())
  .use(bodyParser.json({ type: 'application/json' }))
  .use('/users', userRouter)
  .use(ErrorHandler.all())
  .get('/', (req, res) => res.send('Hello World! \\o/'))
