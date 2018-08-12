function apiErrorHandler (err, req, res, next) {
  if (err.name !== 'ApiError') return next(err)
  if (err.message) {
    res.status(err.status).json({ message: err.message })
  } else {
    res.sendStatus(err.status)
  }
}

module.exports = apiErrorHandler
