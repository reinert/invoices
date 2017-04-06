const AbstractError = require('../../abstract-error')
const HttpStatus = require('http-status')

/**
 * Class representing an API error.
 *
 * @extends AbstractError
 */
class ApiError extends AbstractError {
  /**
   * Creates an API error.
   *
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code.
   * @param {Error} cause - The cause, which is saved for later retrieval.
   */
  constructor (message, status = HttpStatus.INTERNAL_SERVER_ERROR,
               cause = undefined) {
    if (Number.isInteger(message)) {
      super(undefined, cause)
      this.status = message
    } else {
      super(message, cause)
      this.status = status
    }
  }
}

module.exports = ApiError
