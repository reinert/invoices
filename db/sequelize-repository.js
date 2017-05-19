const fs = require('fs')
const Sequelize = require('sequelize')

const datasource = require('./datasource')
const EntityModelMap = require('./entity-model-map')
const { Repository } = require('../core')

class SequelizeRepository extends Repository {
  // @override
  static find (Entity, options) {
    if (options != null && options.hasOwnProperty('id')) {
      return getModel(Entity).findById(options.id, options)
        .then(instance => instance ? new Entity(instance) : null)
    } else {
      return getModel(Entity).findAll(options)
        .then(instances => instances ? proxyArray(Entity, instances) : null)
    }
  }

  // @override
  static save (entity, options) {
    return ensureInstance(entity)._holder
      .save(options)
      .then(instance => instance ? new entity.constructor(instance) : null)
  }

  // @override
  static destroy (entity, options) {
    return ensureInstance(entity)._holder.destroy(options)
  }

  // @override
  static sync (options) {
    return datasource.sync(options)
      .then(() => exec('./db/migrations/invoice-item/set-id-on-insert-trigger.sql'))
      .then(() => exec('./db/migrations/invoice-item/add-amount-to-invoice-on-upsert-trigger.sql'))
      .then(() => exec('./db/migrations/invoice-item/subtract-amount-from-invoice-on-delete-trigger.sql'))
  }
}

function exec (file) {
  return datasource.query(fs.readFileSync(file, { encoding: 'utf-8' }),
    { raw: true })
}

function proxyArray (Entity, arr) {
  return new Proxy(arr, {
    get (target, key, receiver) {
      if (isNumeric(key)) {
        if (target[key] instanceof Sequelize.Instance) {
          target[key] = new Entity(target[key])
        }
      }
      return Reflect.get(target, key, receiver)
    }
  })
}

function getModel (Entity) {
  return EntityModelMap.getModel(Entity)
}

function ensureInstance (entity) {
  if (!(entity._holder instanceof Sequelize.Instance)) {
    entity._holder = getModel(entity.constructor).build(entity._holder)
  }
  return entity
}

function isNumeric (v) {
  return !isNaN(parseFloat(v)) && isFinite(v)
}

module.exports = SequelizeRepository
