export default (Model, Entity) => class Repository {  
  static get Model () { return Model }
  
  static sync () {
    return Model.sync().then(() => this)
  }

  static findAll (options) {
    return Model.findAll().then((instances) => instances ? Repository._proxyArray(instances) : instances)
  }

  static findById (id, options) {
    return Model.findById(id, options).then((instance) => instance ? new Entity(instance) : instance)
  }

  static exists (id, options) {
    return Model.count({ where: { id: id } }).then((result) => result ? true : false)
  }

  static save (entity, options) {
    return entity._instance.save(options).then((instance) => instance ? new Entity(instance) : instance)
  }

//  static update (entity, options) {
//    return Model.update(entity, { where: { id: entity.id } }).then((result) => result[0] ? (result[1] ? new Entity(result[1][0]) : entity) : null})
//  }

  static destroy (entity, options) {
    return entity._instance.destroy(options)
  }

  static _proxyArray (arr) {
    return new Proxy(arr, {
      get(target, key, receiver) {
        if (!isNaN(parseFloat(key)) && isFinite(key)) {
          if (target[key] instanceof Model.Instance) {
            target[key] = new Entity(target[key])
          }
          return target[key]
        }
        return Reflect.get(target, key, receiver)
      }
    })
  }
}
