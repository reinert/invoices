const { NotImplementedError } = require('./errors')

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
