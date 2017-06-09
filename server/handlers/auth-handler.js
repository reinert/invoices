const { ApiError } = require('../errors')
const HttpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const { Repository } = require('../../db')
const { User } = require('../../core')

class AuthHandler {
  static login (req, res, next) {
    if (!req.get('email')) {
      const message = 'email header must be informed'
      return next(new ApiError(message, HttpStatus.BAD_REQUEST))
    }

    if (!req.password) {
      const message = 'encp header must be informed'
      return next(new ApiError(message, HttpStatus.BAD_REQUEST))
    }

    Repository.find(User, { where: { email: req.get('email') } })
      .then(users => {
        if (users.length !== 1) {
          const message = 'Invalid credentials'
          throw new ApiError(message, HttpStatus.UNAUTHORIZED)
        }
        return users[0]
      })
      .then(user => user.comparePassword(req.password))
      .then(success => {
        if (!success) {
          const message = 'Invalid credentials'
          return next(new ApiError(message, HttpStatus.UNAUTHORIZED))
        }

        const secret = process.env.JWT_SECRET
        const options = { expiresIn: '1d' }
        const token = jwt.sign({ email: req.get('email') }, secret, options)

        res.set({ 'x-access-token': token })
        res.sendStatus(HttpStatus.OK)
      })
      .catch(next)
  }
}

module.exports = AuthHandler
