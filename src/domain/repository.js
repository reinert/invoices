export default (Model, Entity) => class Repository {  
  static get Model () { return Model }
  
  static sync () {
    return Model.sync().then(() => this)
  }

  static findAll (options) {
    return Model.findAll().then((instances) => Repository._proxyArray(instances))
  }

  static findById (id, options) {
    return Model.findById(id, options).then((instance) => new Entity(instance))
  }

  static save (entity, options) {
    return entity._instance.save(options).then((instance) => new Entity(instance))
  }

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

