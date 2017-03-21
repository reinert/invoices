import express from 'express'

const ID_PATH = '/:id([0-9]+)'

export default (Entity, route) => {
  let router = express.Router()
    .param('id', (req, res, next, id) => {
      Entity.Repository.findById(id)
        .then((entity) => {
          if (entity) {
            req.entity = entity
            next()
          } else {
            res.sendStatus(404)
          }
        })
        .catch(next)
    })
    .get('/', (req, res, next) => {
      Entity.Repository.findAll()
        .then((entity) => res.json(entity))
        .catch(next)
    })
    .post('/', (req, res, next) => {
      Entity.Repository.save(new Entity(req.body))
        .then((entity) => res.status(201).location(`${req.baseUrl}/${entity.id}`).json(entity))
        .catch(next)
    })
    .get(ID_PATH, (req, res, next) => {
      res.json(req.entity)
    })
    .patch(ID_PATH, (req, res, next) => {
      Entity.Repository.save(req.entity.merge(req.body))
        .then((entity) => res.json(entity))
        .catch(next)
    })
    .put(ID_PATH, (req, res, next) => {
      Entity.Repository.save(req.entity.update(req.body))
        .then((entity) => res.json(entity))
        .catch(next)
    })
    .delete(ID_PATH, (req, res, next) => {
      Entity.Repository.destroy(req.entity)
        .then(() => res.sendStatus(200))
        .catch(next)
    })
  
  router.route = route
  
  return router
}
