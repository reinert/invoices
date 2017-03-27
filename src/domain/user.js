import bcrypt from 'bcrypt'
import { UserModel } from '../persistence'
import Entity from './entity'
import Repository from './repository'

const SALT_ROUNDS = 13

export default class User extends Entity {
  constructor (values) {
    super(values)
  }

  static get Repository () { return UserRepository }

  get Model () { return UserModel }

  setPassword (plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
        .then((hash) => {
          this._password = hash
          this._isEncrypted = true
          return this
        })
  }

  comparePassword (plainPassword) {
    return this._isEncrypted ?
      bcrypt.compare(plainPassword, this._password) :
      Promise.reject(new Error('Password not encrypted yet'))
  }

  toString () { return `User: { id: ${this.id}, username: ${this.username}, email: ${this.email} }` }
}

User.$('username')
User.$('email')
User.$('password', { private: true })
User.$('isEncrypted', { private: true })

class UserRepository extends Repository(UserModel, User) { }
