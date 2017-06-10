const { ApiError } = require('../errors')
const HttpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const { Repository } = require('../../db')
const { User } = require('../../core')

class AuthHandler {
  static signin (req, res, next) {
    const email = req.get('email')
    if (!email || !req.password) {
      if (req.user) {
        return res.status(HttpStatus.OK).json(req.user)
      }
      return next(new ApiError(HttpStatus.BAD_REQUEST))
    }

    Repository.find(User, { where: { email } })
      .then((users) => {
        if (users.length !== 1) {
          const message = 'Invalid credentials'
          throw new ApiError(message, HttpStatus.UNAUTHORIZED)
        }
        return users[0]
      })
      .then((user) => {
        user.comparePassword(req.password).then((success) => {
          if (!success) {
            const message = 'Invalid credentials'
            return next(new ApiError(message, HttpStatus.UNAUTHORIZED))
          }

          const secret = process.env.JWT_SECRET
          const options = { expiresIn: '1d' }
          const token = jwt.sign({ id: user.id }, secret, options)

          res.set({ 'x-access-token': token })
          res.cookie('token', token, { httpOnly: true, maxAge: 60000 * 60 * 24 })
          res.sendStatus(HttpStatus.OK)
        })
      })
      .catch(next)
  }

  static signout (req, res, next) {
    res.cookie('token', 'invalidated', { httpOnly: true, maxAge: 0 })
    res.sendStatus(HttpStatus.OK)
  }
}

module.exports = AuthHandler
