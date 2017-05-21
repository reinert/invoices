const fs = require('fs')
const Sequelize = require('sequelize')

const {
  Entity,
  Repository,
  errors: { InvalidArgumentError }
} = require('../core')

const datasource = require('./datasource')
const getModel = require('./entity-model-map')

class SequelizeRepository extends Repository {
  // @override
  static find (Entity, options = {}) {
    processOptions(options)
    if (options.hasOwnProperty('id')) {
      return getModel(Entity).findById(options.id, options)
        .then(instance => instance ? new Entity(instance) : null)
    } else {
      return getModel(Entity).findAll(options)
        .then(instances => instances ? proxyArray(Entity, instances) : null)
    }
  }

  // @override
  static save (entity, options = {}) {
    processOptions(options)
    return datasource.transaction((t) =>
      ensureInstance(entity, options)._holder.save(options))
      .then(instance => instance ? new entity.constructor(instance) : null)
  }

  // @override
  static destroy (entity, options = {}) {
    processOptions(options)
    return ensureInstance(entity, options)._holder.destroy(options)
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

function proxyArray (Constructor, arr) {
  return new Proxy(arr, {
    get (target, key, receiver) {
      if (typeof key === 'number' || isNumeric(key)) {
        if (target[key] instanceof Sequelize.Instance) {
          target[key] = new Constructor(target[key])
        }
      }
      return Reflect.get(target, key, receiver)
    }
  })
}

function ensureInstance (entity, options) {
  if (!(entity._holder instanceof Sequelize.Instance)) {
    entity._holder = getModel(entity.constructor).build(entity._holder, options)
  }

  for (let p of entity.constructor.metadata.getProperties()) {
    if (entity.p) {
      let pOptions = options.propOptions ? options.propOptions[p] : null
      processOptions(pOptions)
      if (entity.constructor.metadata.isTypeEntity(p)) {
        entity.p._holder =
          getModel(entity.p.constructor).build(entity.p._holder, pOptions)
      } else if (entity.constructor.metadata.isArrayTypeWithGenericEntity(p)) {
        for (let v of entity.p) {
          v._holder = getModel(v.constructor).build(v._holder, pOptions)
        }
      }
    }
  }

  return entity
}

function processOptions (opt) {
  if (opt == null) return

  if (opt.include) {
    for (let i in opt.include) {
      let entityIncl = opt.include[i]

      if (entityIncl == null) continue

      if (entityIncl.prototype instanceof Entity) {
        opt.include[i] = getModel(entityIncl)
      } else if (isAliasModel(entityIncl)) {
        entityIncl.model = getModel(entityIncl.model)
      } else {
        console.log(entityIncl)
        let arg = entityIncl.name ? entityIncl.name : entityIncl.toString()
        throw new InvalidArgumentError(
          `${arg} is not a valid argument for the include option.` +
          `It should be either an Entity successor constructor or an alias` +
          `object in the form of { model: Entity, as: 'alias' }.`)
      }
    }
  }
}

function isAliasModel (opt) {
  return typeof opt.model === 'function' && typeof opt.as === 'string'
}

function isNumeric (v) {
  return typeof v !== 'symbol' && !isNaN(parseFloat(v)) && isFinite(v)
}

module.exports = SequelizeRepository
