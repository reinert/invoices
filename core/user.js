const bcrypt = require('bcrypt')
const Entity = require('./entity')

const SALT_ROUNDS = 13

class User extends Entity {
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
    return `User: {id: ${this.id}, email: ${this.email} }`
  }
}

User.$({
  'email': {},
  'password': { private: true },
  'isEncrypted': { private: true },
  'firstName': {},
  'lastName': {}
})

module.exports = User
