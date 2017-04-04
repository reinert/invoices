import { Repository } from '../../sequelize'

export default (Entity) => class EntityHandler {
  static retrieveEntity (req, res, next, id) {
    Repository.find(Entity, { id: id })
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
    Repository.find(Entity)
      .then((entities) => res.json(entities))
      .catch(next)
  }

  static create (req, res, next) {
    Repository.save(new Entity(req.body))
      .then((entity) => res.status(201).location(`${req.baseUrl}/${entity.id}`).json(entity))
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
      .then(() => res.sendStatus(204))
      .catch(next)
  }
}
