import Sequelize from 'sequelize'
import { Repository } from '../core'
import { EntityModelMap } from './entity-model-map'

export default class RepositoryImpl extends Repository {
  static find (Entity, options) {
    return EntityModelMap.getModel(Entity).findAll().then((instances) => instances ? proxyArray(Entity, instances) : null)
  }

  static save (entity, options) {
    return entity._instance.save(options).then((instance) => instance ? new Entity(instance) : null)
  }

  static destroy (entity, options) {
    return entity._instance.destroy(options)
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
