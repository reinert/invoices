export default (Model, Entity) => class {  
  
  static get Model () { return Model }
  
  static sync () {
    return Model.sync().then(() => this)
  }

  static findAll (options) {
    return Model.findAll().then((instances) => instances.map((instance) => new Entity(instance)))
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
}
