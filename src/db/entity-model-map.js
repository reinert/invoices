import { NonexistentEntityError } from '../core/errors'
import { User } from '../core'
import UserModel from './user-model'

export default class EntityModelMap {
  static getModel (Entity) {
    if (Entity === User) return UserModel
    throw new NonexistentEntityError()
  }
}
