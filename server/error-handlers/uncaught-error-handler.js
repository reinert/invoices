const HttpStatus = require('http-status')

function uncaughtErrorHandler (err, req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    console.error(err)
    res.status(err.status).json({ name: err.name, message: err.message })
  } else {
    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR)
  }
}

module.exports = uncaughtErrorHandler
