import { UserModel } from '../persistence'
import Base from './base'
import Repository from './repository'

export default class User extends Base {
  constructor () {
    super(UserModel, ...arguments)
    
    super.$('id', { set: false })
    super.$('createdAt', { set: false })
    super.$('updatedAt', { set: false })
    super.$('username')
    super.$('password')
    super.$('email')
  }

  static get Repository () { return UserRepository }

  toString () { return `User: { id: ${this.id}, username: ${this.username}, email: ${this.email} }` }
}

class UserRepository extends Repository(UserModel, User) { }
