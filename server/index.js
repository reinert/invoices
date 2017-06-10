const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const express = require('express')
const expressJwt = require('express-jwt')
const helmet = require('helmet')
const HttpStatus = require('http-status')
const morgan = require('morgan')
const { sequelizeErrorHandler } = require('./error-handlers')
const { uncaughtErrorHandler } = require('./error-handlers')
const { apiErrorHandler } = require('./error-handlers')
const { ApiError } = require('./errors')
const {
  authRouter,
  userRouter,
  invoiceRouter
} = require('./routers')

function getToken (req) {
  let token = req.get('Authorization')
  if (token && token.split(' ')[0] === 'Bearer') token = token.split(' ')[1]
  return token || req.cookies.token || null
}

function checkAuth (req, res, next) {
  if (!req.user) {
    next(new ApiError(HttpStatus.UNAUTHORIZED))
  }
  next()
}

function notFoundHandler (req, res, next) {
  next(new ApiError(HttpStatus.NOT_FOUND))
}

module.exports = express()
  .use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
  .use(helmet())
  .use(bodyParser.json({ type: 'application/json' }))
  .use(cookieParser(), expressJwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: false,
    getToken
  }))
  .use('/auth', authRouter)
  .use('/users', checkAuth, userRouter)
  .use('/invoices', checkAuth, invoiceRouter)
  .use(notFoundHandler)
  .use(sequelizeErrorHandler)
  .use(apiErrorHandler)
  .use(uncaughtErrorHandler)
