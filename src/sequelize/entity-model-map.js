import { User } from '../core'
import { NonexistentEntityError } from './erros/nonexistent-entity-error'
import { UserModel } from './user-model'

export default class EntityModelMap {
  static getModel(Entity) {
    if (Entity === User || Entity instanceof User) return UserModel
    throw new NonexistentEntityError()
  }
}