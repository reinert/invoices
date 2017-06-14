const HttpStatus = require('http-status')
const { Repository } = require('../../db')
const ApiError = require('../errors/api-error')

module.exports = (metadata) => {
  const ResourceHandler = createHandlerPrototype(metadata)

  ResourceHandler[metadata.retrieveMethod] = function (req, res, next, id) {
    this.retrieve(req, res, id, req.options)
      .then(entity => {
        if (entity) {
          res.locals[this.var] = entity
          return next()
        }

        return res.sendStatus(HttpStatus.NOT_FOUND)
      })
      .catch(next)
  }.bind(metadata)

  let meta = metadata.parent ? metadata.parent.metadata : null
  while (meta != null) {
    ResourceHandler[meta.retrieveMethod] = function (req, res, next, id) {
      this.retrieve(req, res, id)
        .then(entity => {
          if (entity) {
            res.locals[this.var] = entity
            return next()
          }

          return res.sendStatus(HttpStatus.NOT_FOUND)
        })
        .catch(next)
    }.bind(meta)

    meta = meta.parent ? meta.parent.metadata : null
  }

  return ResourceHandler
}

function createHandlerPrototype (metadata) {
  return class Handler {
    static get metadata () { return metadata }

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

    // ultimately called in each request
    static sendResult (req, res, next) {
      if (res.locals.result !== undefined) {
        res.json(res.locals.result)
      } else {
        res.sendStatus(HttpStatus.NO_CONTENT)
      }
    }

    static getAll (req, res, next) {
      if (req.options.pk) {
        // get all from parent
        req.options.where =
          Object.assign(req.options.where || {}, req.options.pk)
        delete req.options.pk
      }

      Repository.find(metadata.type, req.options)
        .then(entities => Handler.setResultAndProceed(res, entities, next))
        .catch(next)
    }

    static create (req, res, next) {
      req.body = Object.assign(req.body || {}, req.options.pk)

      if (res.locals[metadata.var] === undefined) {
        if (hasParent(res, metadata)) {
          // create entity by inserting into parent
          const len = getParentArray(res, metadata).push(req.body)
          // make created entity available in response
          setEntity(res, metadata, getParentArray(res, metadata)[len - 1])
        } else {
          const Entity = metadata.type
          // TODO: Centralize Entity creation logic
          setEntity(res, metadata, typeof metadata.type.create === 'function'
            ? metadata.type.create(req.body) : new Entity(req.body))
        }
      }

      Repository.save(getEntity(res, metadata), req.options)
        .then(entity => Handler.setResult(res, entity))
        .then(entity => res
          .status(HttpStatus.CREATED)
          .location(`${req.baseUrl}/${entity[metadata.id]}`))
        .then(() => next())
        .catch(next)
    }

    static getOne (req, res, next) {
      Handler.setResultAndProceed(res, getEntity(res, metadata), next)
    }

    static merge (req, res, next) {
      getEntity(res, metadata).merge(req.body)

      Repository.save(getEntity(res, metadata), req.options)
        .then(entity => Handler.setResultAndProceed(res, entity, next))
        .catch(next)
    }

    static update (req, res, next) {
      getEntity(res, metadata).update(req.body)

      Repository.save(getEntity(res, metadata), req.options)
        .then(entity => Handler.setResultAndProceed(res, entity, next))
        .catch(next)
    }

    static delete (req, res, next) {
      if (hasParent(res, metadata)) {
        let arr = getParentArray(res, metadata)
        arr.splice(arr.indexOf(getEntity(res, metadata)), 1)
      }

      Repository.destroy(getEntity(res, metadata), req.options)
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

function hasParent (res, metadata) {
  return metadata.parent && res.locals[metadata.parent.metadata.var] &&
    res.locals[metadata.parent.metadata.var][metadata.parent.alias]
}

function getParent (res, metadata) {
  return res.locals[metadata.parent.metadata.var]
}

function getParentArray (res, metadata) {
  return getParent(res, metadata)[metadata.parent.alias]
}

function getEntity (res, metadata) {
  return res.locals[metadata.var]
}

function setEntity (res, metadata, value) {
  res.locals[metadata.var] = value
}
