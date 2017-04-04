const AbstractError = require('../../abstract-error')

class HeaderValidationError extends AbstractError {
  constructor (header, message, cause) {
    super(message, cause)
    this.header = header
    this.errors = [{header: header, message: message}]
  }
}

module.exports = HeaderValidationError
