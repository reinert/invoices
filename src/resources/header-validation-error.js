import AbstractError from '../abstract-error'

export default class HeaderValidationError extends AbstractError {
  constructor (header, message, cause) {
    super(message, cause)
    this.header = header
    this.errors = [{header: header, message: message}]
  }
}