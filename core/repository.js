const NotImplementedError = require('./errors').NotImplementedError

class Repository {
  static find (Entity, options) {
    throw new NotImplementedError()
  }

  static save (entity, options) {
    throw new NotImplementedError()
  }

  static destroy (entity, options) {
    throw new NotImplementedError()
  }

  static sync (options) {
    throw new NotImplementedError()
  }
}

module.exports = Repository
