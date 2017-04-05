const httpStatus = require('http-status')
const { Repository } = require('../../db')

module.exports = (Entity) => class EntityHandler {
  static retrieveEntity (req, res, next, id) {
    Repository.find(Entity, { id: id })
      .then((entity) => {
        if (entity) {
          req.entity = entity
          return next()
        }

        res.sendStatus(httpStatus.NOT_FOUND)
      })
      .catch(next)
  }

  static getAll (req, res, next) {
    Repository.find(Entity)
      .then((entities) => res.json(entities))
      .catch(next)
  }

  static create (req, res, next) {
    Repository.save(new Entity(req.body))
      .then((entity) =>
        res.status(httpStatus.CREATED)
           .location(`${req.baseUrl}/${entity.id}`)
           .json(entity))
      .catch(next)
  }

  static getOne (req, res, next) {
    res.json(req.entity)
  }

  static merge (req, res, next) {
    Repository.save(req.entity.merge(req.body))
      .then((entity) => res.json(entity))
      .catch(next)
  }

  static update (req, res, next) {
    Repository.save(req.entity.update(req.body))
      .then((entity) => res.json(entity))
      .catch(next)
  }

  static delete (req, res, next) {
    Repository.destroy(req.entity)
      .then(() => res.sendStatus(httpStatus.NO_CONTENT))
      .catch(next)
  }
}
