const HttpStatus = require('http-status')

function sequelizeValidationErrorHandler (err, req, res, next) {
  if (err.name !== 'SequelizeValidationError') return next(err)
  if (process.env.NODE_ENV === 'development') console.error(err)
  res.status(HttpStatus.BAD_REQUEST).json(err)
}

module.exports = sequelizeValidationErrorHandler
