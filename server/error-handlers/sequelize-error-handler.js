const HttpStatus = require('http-status')

function sequelizeValidationErrorHandler (err, req, res, next) {
  if (err.name !== 'SequelizeValidationError') return next(err)
  res.status(HttpStatus.BAD_REQUEST).json({ message: 'Validation error' })
}

module.exports = sequelizeValidationErrorHandler
