const HttpStatus = require('http-status')
const { Repository } = require('../../db')
const ApiError = require('../errors/api-error')

module.exports = (Entity) => class ResourceHandler {
  static retrieveOptions (req, res, next) {
    if (req.query.options) {
      try {
        req.options = JSON.parse(req.query.options)
      } catch (err) {
        const message = `The query parameter 'options' is not valid JSON: ` +
          `${req.query.options}`
        return next(new ApiError(message, HttpStatus.BAD_REQUEST))
      }
    } else {
      req.options = {}
    }

    return next()
  }

  // after #retrieveOptions
  static retrieveEntity (req, res, next, id) {
    req.options.id = id
    Repository.find(Entity, req.options)
      .then(entity => {
        if (entity) {
          req.entity = entity
          next()
        } else {
          res.sendStatus(HttpStatus.NOT_FOUND)
        }
        return null
      })
      .catch(next)
  }

  static getAll (req, res, next) {
    Repository.find(Entity, req.options)
      .then(entities => res.json(entities))
      .catch(next)
  }

  static create (req, res, next) {
    const entity = typeof Entity.create === 'function'
      ? Entity.create(req.body) : new Entity(req.body)
    Repository.save(entity, req.options)
      .then(entity =>
        res.status(HttpStatus.CREATED)
          .location(`${req.baseUrl}/${entity.id}`)
          .json(entity))
      .catch(next)
  }

  static getOne (req, res, next) {
    res.json(req.entity)
  }

  static merge (req, res, next) {
    Repository.save(req.entity.merge(req.body), req.options)
      .then(entity => res.json(entity))
      .catch(next)
  }

  static update (req, res, next) {
    Repository.save(req.entity.update(req.body), req.options)
      .then(entity => res.json(entity))
      .catch(next)
  }

  static delete (req, res, next) {
    Repository.destroy(req.entity, req.options)
      .then(() => res.sendStatus(HttpStatus.NO_CONTENT))
      .catch(next)
  }
}
