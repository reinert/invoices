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
    return `User: {id: ${this.id}, username: ${this.username}, ` +
      `email: ${this.email} }`
  }
}

User.$('username')
User.$('email')
User.$('password', { private: true })
User.$('isEncrypted', { private: true })

module.exports = User
