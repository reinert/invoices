const bcrypt = require('bcrypt')
const PersistentEntity = require('./persistent-entity')

const SALT_ROUNDS = 13

const UserRole = { NORMAL: 'NORMAL', ADMIN: 'ADMIN' }

class User extends PersistentEntity {
  static get properties () {
    return {
      'email': {
        type: String
      },
      'password': {
        type: String,
        private: true
      },
      'isEncrypted': {
        type: Boolean,
        private: true
      },
      'firstName': {
        type: String
      },
      'lastName': {
        type: String
      },
      'role': {
        type: String,
        readOnly: true,
        value: UserRole.NORMAL
      }
    }
  }

  setRole (userRole) {
    this._set('role', userRole, true)
    return Promise.resolve(this)
  }

  setPassword (plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS)
        .then((hash) => {
          this._password = hash
          this._isEncrypted = true
          return this
        })
  }

  comparePassword (plainPassword) {
    return this._isEncrypted
      ? bcrypt.compare(plainPassword, this._password)
      : Promise.reject(new Error('Password not encrypted yet'))
  }

  toString () {
    return `User: { id: ${this.id}, email: ${this.email} }`
  }
}

module.exports = { User, UserRole }
