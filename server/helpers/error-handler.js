const { ApiError } = require('../errors')

function errorHandler (err, req, res, next) {
  console.dir(err)

  if (!(err instanceof ApiError)) err = new ApiError(err.message)

  if (process.env.NODE_ENV === 'development' || err.isPublic) {
    res.status(err.status).json({
      name: err.name,
      message: err.message
    })
  } else {
    res.sendStatus(err.status)
  }
}

module.exports = errorHandler
