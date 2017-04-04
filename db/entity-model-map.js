const NonexistentEntityError = require('../core/errors').NonexistentEntityError
const UserModel = require('./user-model')
const User = require('../core').User

class EntityModelMap {
  static getModel (Entity) {
    if (Entity === User) return UserModel
    throw new NonexistentEntityError()
  }
}

module.exports = EntityModelMap
