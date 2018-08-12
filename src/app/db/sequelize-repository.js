const fs = require('fs')
const Sequelize = require('sequelize')
const humps = require('humps')

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
    processOptions(options, Entity)
    if (options.pk) {
      options.where = Object.assign(options.where || {}, options.pk)
      delete options.pk
      options.where = humps.decamelizeKeys(options.where)
      return getModel(Entity).findOne(options)
        .then(instance => asEntity(Entity, instance))
    } else {
      options.where = humps.decamelizeKeys(options.where)
      return getModel(Entity).findAll(options)
        .then(instances => instances ? proxyArray(Entity, instances) : null)
    }
  }

  // @override
  static save (entity, options = {}) {
    processOptions(options, entity)
    // TODO: Only use transaction if options.include is not empty
    // If so, validate before starting the transaction
    return datasource.transaction((t) =>
      ensureInstance(entity, options)._holder.save(options))
      .then(instance => asEntity(entity.constructor, instance))
  }

  // @override
  static destroy (entity, options = {}) {
    processOptions(options, entity)
    return ensureInstance(entity, options)._holder.destroy(options)
  }

  // @override
  static sync (options) {
    return exec('./src/app/db/migrations/reset-database.sql')
      .then(() => exec('./src/app/db/migrations/users.sql'))
      .then(() => exec('./src/app/db/migrations/invoices.sql'))
      .then(() => exec('./src/app/db/migrations/invoice-items.sql'))
      .then(() => datasource.sync(options))
  }
}

function exec (file) {
  return datasource.query(fs.readFileSync(file, { encoding: 'utf-8' }),
    { raw: true })
}

function proxyArray (Entity, arr) {
  return new Proxy(arr, {
    get (target, key, receiver) {
      if (typeof key === 'number' || isNumeric(key)) {
        if (target[key] instanceof Sequelize.Instance) {
          target[key] = asEntity(Entity, target[key])
        }
      }
      return Reflect.get(target, key, receiver)
    }
  })
}

function asEntity (Entity, values) {
  if (!values) return null

  // TODO: Centralize Entity creation logic
  return typeof Entity.create === 'function'
    ? Entity.create(values)
    : new Entity(values)
}

function ensureInstance (entity, options) {
  if (!(entity._holder instanceof Sequelize.Instance)) {
    entity._holder = getModel(entity.constructor).build(entity._holder, options)
  }

  for (let p of entity.constructor.metadata.getProperties()) {
    if (entity.p) {
      let pOptions = options.propOptions ? options.propOptions[p] : null
      processOptions(pOptions, entity.p)
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

function processOptions (opt, entity) {
  if (!opt || !opt.include) return

  for (let i in opt.include) {
    let item = opt.include[i]

    if (item == null) continue

    // FIXME: handle nested includes
    if (typeof item === 'string') {
      const meta = typeof entity === 'object'
        ? entity.constructor.metadata
        : entity.metadata
      const type = meta.isArrayTypeWithGenericEntity(item)
        ? meta.getGenericType(item)
        : meta.getType(item)
      opt.include[i] = { model: getModel(type), as: item }
      return
    }

    if (item.prototype instanceof Entity) {
      opt.include[i] = getModel(item)
      return
    }

    if (isAliasModel(item)) {
      if (item.model.prototype instanceof Entity) {
        item.model = getModel(item.model)
      }
      return
    }

    let arg = item.name ? item.name : item.toString()
    throw new InvalidArgumentError(
      `${arg} is not a valid argument for the include option. ` +
      `It should be either an Entity successor constructor or an alias ` +
      `object in the form of { model: Entity, as: 'alias' }.`)
  }
}

function isAliasModel (inclItem) {
  return typeof inclItem.as === 'string' && (
      typeof inclItem.model === 'function' || typeof inclItem.model === 'object'
    )
}

function isNumeric (v) {
  return typeof v !== 'symbol' && !isNaN(parseFloat(v)) && isFinite(v)
}

module.exports = SequelizeRepository
