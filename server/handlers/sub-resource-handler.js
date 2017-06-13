const HttpStatus = require('http-status')
const { Repository } = require('../../db')
const ResourceHandler = require('./resource-handler')
const { processOptions, lowerFirstLetter } = require('./resource-handler')

module.exports = (Entity, Parent, options) => {
  options = processOptionsWithParent(Entity, Parent, options)

  return class SubResourceHandler extends ResourceHandler(Entity, options) {
    static get PARENT_ID_PARAM () { return options.pkParentFkProperty }

    // after #parseOptions and before #retrieveEntity
    static [options.parentRetrieveMethod] (req, res, next, id) {
      id = Parent.coerce(id, options.parentPkProperty)

      req.options.pk = Object.assign(req.options.pk || {},
        { [options.pkParentFkProperty]: id })

      const findOpt = {
        pk: { [options.parentPkProperty]: id },
        include: [{ model: Entity, as: options.relationProperty }]
      }

      Repository.find(Parent, findOpt)
        .then(entity => {
          if (entity) {
            res.locals[options.parentReqProperty] = entity
            return next()
          }

          return res.sendStatus(HttpStatus.NOT_FOUND)
        })
        .catch(next)
    }

    // @override
    static [options.retrieveMethod] (req, res, next, id) {
      id = Entity.coerce(id, options.pkProperty)

      req.options.pk = Object.assign(req.options.pk || {},
        { [options.pkProperty]: id })

      const e = res.locals[options.parentReqProperty][options.relationProperty]
        .find(item => item[options.pkProperty] === id)

      if (!e) {
        return res.sendStatus(HttpStatus.NOT_FOUND)
      }

      res.locals[options.reqProperty] = e
      return next()
    }

    // @override
    static getAll (req, res, next) {
      req.options.where = Object.assign(req.options.where || {}, req.options.pk)
      delete req.options.pk

      return super.getAll(req, res, next)
    }

    // @override
    static create (req, res, next) {
      req.body = Object.assign(req.body || {}, req.options.pk)

      // create entity by inserting into parent
      const i = res.locals[options.parentReqProperty][options.relationProperty]
        .push(req.body)
      // make created entity available in response
      res.locals[options.reqProperty] =
        res.locals[options.parentReqProperty][options.relationProperty][i]

      return super.create(req, res, next)
    }

    // @override
    static delete (req, res, next) {
      let arr = res.locals[options.parentReqProperty][options.relationProperty]
      arr.splice(arr.indexOf(res.locals[options.reqProperty]), 1)

      return super.delete(req, res, next)
    }
  }
}

function processOptionsWithParent (Entity, Parent, options) {
  if (!options || !options.relationProperty) {
    throw new Error('Parent relationProperty must be specified in options ' +
      'argument.')
  }

  const opt = processOptions(Entity, options)

  opt.relationProperty = options.relationProperty
  opt.pkParentFkProperty = options.pkParentFkProperty
    ? options.pkParentFkProperty
    : lowerFirstLetter(Parent.name) + 'Id'
  opt.parentPkProperty = options.parentPkProperty
    ? options.parentPkProperty
    : 'id'
  opt.parentReqProperty = options.parentReqProperty
    ? options.parentReqProperty
    : lowerFirstLetter(Parent.name)
  opt.parentRetrieveMethod = options.parentRetrieveMethod
    ? options.parentRetrieveMethod
    : `retrieve${Parent.name}`

  return opt
}
