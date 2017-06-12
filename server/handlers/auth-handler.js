const { ApiError } = require('../errors')
const HttpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const { Repository } = require('../../db')
const { User, UserRole } = require('../../core')

class AuthHandler {
  static requireIdentity (req, res, next) {
    if (req.user.role !== UserRole.ADMIN && req.user.id !== req.entity.id) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED))
    }
    next()
  }

  static requireAdmin (req, res, next) {
    if (req.user.role !== UserRole.ADMIN) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED))
    }
    next()
  }

  static signin (req, res, next) {
    const email = req.get('email')
    if (!email || !req.password) {
      if (req.user) {
        return Repository.find(User, { pk: { id: req.user.id } })
          .then((user) => res.status(HttpStatus.OK).json(user))
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
          const tokenData = { id: user.id, role: user.role }
          const token = jwt.sign(tokenData, secret, options)

          res.set({ 'x-access-token': token })

          const cookieOptions = { httpOnly: true, maxAge: 60000 * 60 * 24 }
          res.cookie('token', token, cookieOptions)

          res.status(HttpStatus.OK).json(user)
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
