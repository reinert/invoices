const AbstractError = require('../../abstract-error')
const httpStatus = require('http-status')

/**
 * Class representing an API error.
 * @extends AbstractError
 */
class ApiError extends AbstractError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code.
   * @param {boolean} isPublic - Whether the error message should be public.
   */
  constructor (message, status = httpStatus.INTERNAL_SERVER_ERROR,
               isPublic = false) {
    super(message)
    this.status = status
    this.isPublic = isPublic
  }
}

module.exports = ApiError
