const HttpStatus = require('http-status')
const { Repository } = require('../../db')
const ApiError = require('../errors/api-error')

module.exports = (Entity, options) => {
  options = processOptions(Entity, options)

  return class ResourceHandler {
    static get ID_PARAM () { return options.pkProperty }

    static parseOptions (req, res, next) {
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

    // after #parseOptions
    static [options.retrieveMethod] (req, res, next, id) {
      req.options.pk = Object.assign(req.options.pk || {},
        { [options.pkProperty]: Entity.coerce(id, options.pkProperty) })

      Repository.find(Entity, req.options)
        .then(entity => {
          if (entity) {
            req[options.reqProperty] = entity
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
            .location(`${req.baseUrl}/${entity[options.pkProperty]}`)
            .json(entity))
        .catch(next)
    }

    static getOne (req, res, next) {
      res.json(req[options.reqProperty])
    }

    static merge (req, res, next) {
      Repository.save(req[options.reqProperty].merge(req.body), req.options)
        .then(entity => res.json(entity))
        .catch(next)
    }

    static update (req, res, next) {
      Repository.save(req[options.reqProperty].update(req.body), req.options)
        .then(entity => res.json(entity))
        .catch(next)
    }

    static delete (req, res, next) {
      Repository.destroy(req[options.reqProperty], req.options)
        .then(() => res.sendStatus(HttpStatus.NO_CONTENT))
        .catch(next)
    }
  }
}

function processOptions (Entity, options) {
  const opt = {
    reqProperty: lowerFirstLetter(Entity.name),
    pkProperty: 'id',
    retrieveMethod: `retrieve${Entity.name}`
  }

  if (options) {
    if (options.reqProperty) opt.reqProperty = options.reqProperty
    if (options.pkProperty) opt.pkProperty = options.pkProperty
    if (options.retrieveMethod) opt.retrieveMethod = options.retrieveMethod
  }

  return opt
}

function lowerFirstLetter (string) {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

module.exports.processOptions = processOptions
module.exports.lowerFirstLetter = lowerFirstLetter
