class ErrorHandler {
  static all () {
    return [this.headerValidation, this.sequelizeValidation, this.uncaught]
  }

  static headerValidation (err, req, res, next) {
    if (err.name !== 'HeaderValidationError') {
      return next(err)
    }

    console.log('--- HEADER VALIDATION ERROR OCURRED ---')

    res.status(400).json(err)
  }

  static sequelizeValidation (err, req, res, next) {
    if (err.name !== 'SequelizeValidationError') {
      return next(err)
    }

    err.name = 'ResourceValidationError'

    console.log('--- RESOURCE VALIDATION ERROR OCURRED ---')

    res.status(400).json(err)
  }

  static uncaught (err, req, res, next) {
    console.log('--- UNEXPECTED ERROR OCURRED ---')
    console.dir(err)

    res.status(500).json({
      name: 'UnexpectedError',
      message: 'An unexpected error occurred. Please try again later.',
      errors: []
    })
  }
}

module.exports = ErrorHandler
