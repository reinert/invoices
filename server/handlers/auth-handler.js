const { HeaderValidationError } = require('../errors')
const httpStatus = require('http-status')
const jwt = require('jsonwebtoken')
const { Repository } = require('../../db')
const { User } = require('../../core')

class AuthHandler {
  static login (req, res, next) {
    if (!req.get('email')) {
      return next(new HeaderValidationError('email', 'email must be informed'))
    }
    if (!req.password) {
      return next(new HeaderValidationError('encp', 'encp must be informed'))
    }
    Repository.find(User, { where: { 'email': req.get('email') } })
      .then(users => users[0])
      .then(user => user.comparePassword(req.password))
      .then(success => {
        if (!success) return Promise.reject(new Error())

        const secret = process.env.JWT_SECRET
        const options = { expiresIn: '1d' }
        const token = jwt.sign({ email: req.get('email') }, secret, options)

        res.set({ 'x-access-token': token })
        res.sendStatus(httpStatus.OK)
      })
      .catch(e => res.sendStatus(httpStatus.UNAUTHORIZED))
  }
}

module.exports = AuthHandler
