import NotImplementedError from './errors/not-implemented-error'

export default class Repository {
  static find (Entity, options) {
    throw new NotImplementedError()
  }

  static save (entity, options) {
    throw new NotImplementedError()
  }

  static destroy (entity, options) {
    throw new NotImplementedError()
  }
}
