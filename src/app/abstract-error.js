class AbstractError extends Error {
  constructor (message, cause) {
    super(message)
    this.cause = cause
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

module.exports = AbstractError
