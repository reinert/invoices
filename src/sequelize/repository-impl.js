import { override } from 'core-decorators'
import Sequelize from 'sequelize'
import { Repository, Holder } from '../core'
import EntityModelMap from './entity-model-map'

export default class RepositoryImpl extends Repository {
  @override
  static find (Entity, options) {
    return options != null && options.hasOwnProperty('id')
      ? getModel(Entity).findById(options.id, options).then((instance) => instance ? new Entity(instance) : null)
      : getModel(Entity).findAll(options).then((instances) => instances ? proxyArray(Entity, instances) : null)
  }

  @override
  static save (entity, options) {
    return ensureInstance(entity)._holder.save(options).then((instance) => instance ? new entity.constructor(instance) : null)
  }

  @override
  static destroy (entity, options) {
    return ensureInstance(entity)._holder.destroy(options)
  }
}

function proxyArray (Entity, arr) {
  return new Proxy(arr, {
    get (target, key, receiver) {
      if (!isNaN(parseFloat(key)) && isFinite(key)) {
        if (target[key] instanceof Sequelize.Instance) {
          target[key] = new Entity(target[key])
        }
        return target[key]
      }
      return Reflect.get(target, key, receiver)
    }
  })
}

function getModel (Entity) {
  return EntityModelMap.getModel(Entity)
}

function ensureInstance (entity) {
  if (entity._holder instanceof Holder) {
    entity._holder = getModel(entity.constructor).build(entity._holder._values)
  }
  return entity
}
