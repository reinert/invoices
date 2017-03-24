import express from 'express'

export default (Entity) => class Resource {
  static get ID_PARAM () { return 'id' }
  static get ID_PATH () { return`/:${this.ID_PARAM}([0-9]+)` }

  static getRouter (route) {
    let router = express.Router()
    this.bind(router)
    router.route = route
    return router
  }
  
  static bind (router) {
    return router
      .param(this.ID_PARAM, this.retrieveEntity)
      .get('/', this.getAll)
      .post('/', this.create)
      .get(this.ID_PATH, this.getOne)
      .patch(this.ID_PATH, this.patch)
      .put(this.ID_PATH, this.update)
      .delete(this.ID_PATH, this.delete)
  }

  static retrieveEntity (req, res, next, id) {
    Entity.Repository.findById(id)
      .then((entity) => {
        if (entity) {
          req.entity = entity
          return next()
        }

        res.sendStatus(404)
      })
      .catch(next)
  }

  static getAll (req, res, next) {
    Entity.Repository.findAll()
      .then((entity) => res.json(entity))
      .catch(next)
  }

  static create (req, res, next) {
    Entity.Repository.save(new Entity(req.body))
      .then((entity) => res.status(201).location(`${req.baseUrl}/${entity.id}`).json(entity))
      .catch(next)
  }

  static getOne (req, res, next) {
    res.json(req.entity)
  }

  static patch (req, res, next) {
    Entity.Repository.save(req.entity.merge(req.body))
      .then((entity) => res.json(entity))
      .catch(next)
  }

  static update (req, res, next) {
    Entity.Repository.save(req.entity.update(req.body))
      .then((entity) => res.json(entity))
      .catch(next)
  }

  static delete (req, res, next) {
    Entity.Repository.destroy(req.entity)
      .then(() => res.sendStatus(204))
      .catch(next)
  }
}
