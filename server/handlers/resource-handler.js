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
            res.locals[options.reqProperty] = entity
            return next()
          }

          return res.sendStatus(HttpStatus.NOT_FOUND)
        })
        .catch(next)
    }

    // ultimately called in each request
    static sendResult (req, res, next) {
      if (res.locals.result !== undefined) {
        res.json(res.locals.result)
      } else {
        res.sendStatus(HttpStatus.NO_CONTENT)
      }
    }

    static getAll (req, res, next) {
      Repository.find(Entity, req.options)
        .then(entities =>
          ResourceHandler.setResultAndProceed(res, entities, next))
        .catch(next)
    }

    static create (req, res, next) {
      if (res.locals[options.reqProperty] === undefined) {
        // TODO: Centralize Entity creation logic
        res.locals[options.reqProperty] = typeof Entity.create === 'function'
          ? Entity.create(req.body) : new Entity(req.body)
      }

      Repository.save(res.locals[options.reqProperty], req.options)
        .then(entity => ResourceHandler.setResult(res, entity))
        .then(entity => res
          .status(HttpStatus.CREATED)
          .location(`${req.baseUrl}/${entity[options.pkProperty]}`))
        .then(() => next())
        .catch(next)
    }

    static getOne (req, res, next) {
      ResourceHandler.setResultAndProceed(res, res.locals[options.reqProperty], next)
    }

    static merge (req, res, next) {
      res.locals[options.reqProperty].merge(req.body)

      Repository.save(res.locals[options.reqProperty], req.options)
        .then(entity => ResourceHandler.setResultAndProceed(res, entity, next))
        .catch(next)
    }

    static update (req, res, next) {
      res.locals[options.reqProperty].update(req.body)

      Repository.save(res.locals[options.reqProperty], req.options)
        .then(entity => ResourceHandler.setResultAndProceed(res, entity, next))
        .catch(next)
    }

    static delete (req, res, next) {
      Repository.destroy(res.locals[options.reqProperty], req.options)
        .then(() => next())
        .catch(next)
    }

    static setResult (res, result) {
      res.locals.result = result
      return result
    }

    static setResultAndProceed (res, result, next) {
      this.setResult(res, result)
      next()
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
