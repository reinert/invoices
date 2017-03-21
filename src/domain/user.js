import { UserModel } from '../persistence'
import Entity from './entity'
import Repository from './repository'

export default class User extends Entity {
  constructor () {
    super(UserModel, ...arguments)
    
    super.$('username')
    super.$('password')
    super.$('email')
  }

  static get Repository () { return UserRepository }

  toString () { return `User: { id: ${this.id}, username: ${this.username}, email: ${this.email} }` }
}

class UserRepository extends Repository(UserModel, User) {}
