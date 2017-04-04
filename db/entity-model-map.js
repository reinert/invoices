const { errors: { NonexistentEntityError } } = require('../core')
const UserModel = require('./user-model')
const User = require('../core').User

class EntityModelMap {
  static getModel (Entity) {
    if (Entity === User) return UserModel
    throw new NonexistentEntityError()
  }
}

module.exports = EntityModelMap
