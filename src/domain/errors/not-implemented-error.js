import AbstractError from '../../abstract-error'

export default class NotImplementedError extends AbstractError {
  constructor (message) {
    super(message)
  }
}
