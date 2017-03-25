import { override } from 'core-decorators';
import { User } from '../domain'
import HeaderValidationError from './errors/header-validation-error'
import Resource from './resource'

const B64_REGEX = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

export default class UserResource extends Resource(User) {
  static retrievePassword (req, res, next) {
    let b64Password = req.get('hash')

    if (b64Password) {
      try {
        if (!B64_REGEX.test(b64Password)) throw new TypeError('Not a base64 string')
        req.password = Buffer.from(b64Password, 'base64').toString()
      } catch (err) {
        return next(new HeaderValidationError('hash', 'Invalid hash format. Are you sure it is base64 encoded?'), err)
      }
    }

    return next()
  }

  @override
  static bind (router) {
    return super.bind(router.use(this.retrievePassword))
  }

  @override
  static create (req, res, next) {
    if (!req.password) {
      return next(new HeaderValidationError('hash', 'Hash must be informed'))
    }

    let user = new User(req.body)
    user.setPassword(req.password)
      .then((user) => User.Repository.save(user))
      .then((user) => res.status(201).location(`${req.baseUrl}/${user.id}`).json(user))
      .catch(next)
  }

  @override
  static merge (req, res, next) {
    req.entity.merge(req.body)

    return (req.password ? req.entity.setPassword(req.password) : Promise.resolve(req.entity))
      .then((user) => User.Repository.save(user))
      .then((user) => res.json(user))
      .catch(next)
  }
}
