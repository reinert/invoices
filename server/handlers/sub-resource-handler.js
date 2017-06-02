const ResourceHandler = require('./resource-handler')

module.exports = (Entity, idProp, parentProp) =>
  class SubResourceHandler extends ResourceHandler(Entity, idProp) {
    static get PARENT_ID_PARAM () { return parentProp }

    // after #retrieveOptions and before #retrieveEntity
    static retrieveParentId (req, res, next, id) {
      req.options.pk = Object.assign(req.options.pk || {}, { [parentProp]: id })

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
      
      return super.create(req, res, next)
    }

    // @override
    static merge (req, res, next) {
      req.body = Object.assign(req.body || {}, req.options.pk)

      return super.merge(req, res, next)
    }

    // @override
    static update (req, res, next) {
      req.body = Object.assign(req.body || {}, req.options.pk)

      return super.update(req, res, next)
    }
}
