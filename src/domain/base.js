import Sequelize from 'sequelize'

export default class Base {

  constructor () {
    let model;
    if (arguments.length > 1 && arguments[1] instanceof Sequelize.Instance) {
      model = arguments[1]
    } else {
      model = arguments[0].build(arguments[1])
    }

    Object.defineProperty(this, '_instance', {
      enumerable: false,
      configurable: false,
      value: model
    })

    Object.defineProperty(this, '_Model', {
      enumerable: false,
      configurable: false,
      value: arguments[0]
    })  
  }

  $ (property, descriptor) {
    Object.defineProperty(this, property, processDescriptor(property, descriptor))
  }
}

function processDescriptor (property, descriptor) {
  const d = { 
    enumerable: true, 
    configurable: true, 
    get: function () { return this._instance.getDataValue(property) },
    set: function (value) { return this._instance.setDataValue(property, value) }
  }

  if (descriptor) {
    if (descriptor.hasOwnProperty('enumerable')) d.enumerable = descriptor.enumerable
    if (descriptor.hasOwnProperty('configurable')) d.configurable = descriptor.configurable
    if (descriptor.hasOwnProperty('value')) d.value = descriptor.value

    if (descriptor.hasOwnProperty('get')) {  
      if (descriptor.get === false) { delete d.get } else { d.get = descriptor.get }
    }

    if (descriptor.hasOwnProperty('set')) {
      if (descriptor.set === false) { delete d.set } else { d.set = descriptor.set }
    }
  }

  return d
}

