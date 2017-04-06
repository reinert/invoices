const AbstractError = require('../../abstract-error')

/**
 * Class representing an Internal error.
 *
 * @extends AbstractError
 */
class InternalError extends AbstractError {
  /**
   * Creates an Internal error.
   *
   * @param {string} message - Error message.
   * @param {Error} cause - The cause, which is saved for later retrieval.
   */
  constructor (message, cause = undefined) {
    super(message, cause)
  }
}

module.exports = InternalError
