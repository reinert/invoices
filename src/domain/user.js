import bcrypt from 'bcrypt'
import { UserModel } from '../persistence'
import Entity from './entity'
import Repository from './repository'

const SALT_ROUNDS = 13

export default class User extends Entity {
  constructor () {
    super(UserModel, ...sanitizeArgs(arguments))
    
    super.$('username')
    super.$('email')
  }

  static get Repository () { return UserRepository }

  setPassword (plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
        .then((hash) => {
          this._set('password', hash)
          this._set('isEncrypted', true)
          return this
        })
  }

  comparePassword (plainPassword) {
    return this._get('isEncrypted') ?
      bcrypt.compare(plainPassword, this._get('password')) :
      Promise.reject(new Error('Password not encrypted yet'))
  }

  toString () { return `User: { id: ${this.id}, username: ${this.username}, email: ${this.email} }` }
}

class UserRepository extends Repository(UserModel, User) { }

function sanitizeArgs(args) {
  if (args[0]) {
    delete args[0].password
    delete args[0].isEncrypted
  }
  return args
}
