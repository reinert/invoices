const EntityHandler = require('./entity-handler')
const { HeaderValidationError } = require('../errors')
const { Repository } = require('../../db')
const { User } = require('../../core')

const B64_REGEX = new RegExp(
  '^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$'
)

class UserHandler extends EntityHandler(User) {
  static retrievePassword (req, res, next) {
    let b64Password = req.get('encp')

    if (b64Password) {
      try {
        if (!B64_REGEX.test(b64Password)) {
          throw new TypeError('Not a base64 string')
        }
        req.password = Buffer.from(b64Password, 'base64').toString()
      } catch (err) {
        const errorMessage =
          'Invalid encp format. Are you sure it is base64 encoded?'
        return next(new HeaderValidationError('encp', errorMessage), err)
      }
    }

    return next()
  }

  // @override
  static create (req, res, next) {
    if (!req.password) {
      const errorMessage = 'encp header must be informed'
      return next(new HeaderValidationError('encp', errorMessage))
    }

    let user = new User(req.body)
    user.setPassword(req.password)
      .then((user) => Repository.save(user))
      .then((user) =>
        res.status(201).location(`${req.baseUrl}/${user.id}`).json(user))
      .catch(next)
  }

  // @override
  static merge (req, res, next) {
    req.entity.merge(req.body)

    return (req.password ? req.entity.setPassword(req.password)
                         : Promise.resolve(req.entity))
      .then((user) => Repository.save(user))
      .then((user) => res.json(user))
      .catch(next)
  }
}

module.exports = UserHandler
