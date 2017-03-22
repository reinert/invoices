import Sequelize from 'sequelize'

export default class Entity {
  constructor () {
    let model;
    if (arguments.length > 1 && arguments[1] instanceof Sequelize.Instance) {
      model = arguments[1]
    } else {
      model = arguments[0].build(arguments[1])
    }

    Object.defineProperty(this, '_instance', {
      value: model,
      enumerable: false,
      writable: false,
      configurable: false
    })

    Object.defineProperty(this, '_Model', {
      value: arguments[0],
      enumerable: false,
      writable: false,
      configurable: false
    })

    Object.defineProperty(this, '_writables', {
      value: {},
      enumerable: false,
      writable: false,
      configurable: false
    })

    Object.defineProperty(this, 'isNewRecord', {
      get: () => this._instance.isNewRecord,
      enumerable: false,
      configurable: false
    })

    Object.defineProperty(this, 'id', {
      get: () => this._instance.get('id'),
      enumerable: true,
      configurable: false
    })

    Object.defineProperty(this, 'createdAt', {
      get: () => this._instance.get('createdAt'),
      enumerable: true,
      configurable: false
    })

    Object.defineProperty(this, 'updatedAt', {
      get: () => this._instance.get('updatedAt'),
      enumerable: true,
      configurable: false
    })
  }

  $ (property, descriptor) {
    Object.defineProperty(this, property, processDescriptor(property, descriptor))
    if (descriptor) {
      if (!descriptor.computed && descriptor.set !== false) this._writables[property] = true
    } else {
      this._writables[property] = true
    }
  }

  _get (property) {
    return this._instance.get(property)
  }

  _set (property, value) {
    this._instance.set(property, value)
  }

  merge (values) {
    if (values) {
      for (let p in values) {
        if (this._writables[p]) this[p] = values[p]
      }
    }
    return this
  }

  update (values) {
    if (values) {
      for (let p in this._writables) {
        this[p] = (values[p] === undefined) ? null : values[p]
      }
    }
    return this
  }
}

function processDescriptor (property, descriptor) {
  const d = { 
    enumerable: true, 
    configurable: true, 
    get: function () { return this._instance.get(property) },
    set: function (value) { this._instance.set(property, value) }
  }

  if (descriptor) {
    if (descriptor.hasOwnProperty('enumerable')) d.enumerable = descriptor.enumerable
    if (descriptor.hasOwnProperty('configurable')) d.configurable = descriptor.configurable

    if (descriptor.hasOwnProperty('get')) {  
      if (descriptor.get === false) { delete d.get } else { d.get = descriptor.get }
    }

    if (descriptor.hasOwnProperty('set')) {
      if (descriptor.set === false || descriptor.computed) { delete d.set } else { d.set = descriptor.set }
    }
  }

  return d
}
