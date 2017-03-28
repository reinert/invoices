import Sequelize from 'sequelize'
import NotImplementedError from './errors/not-implemented-error'

export default class Entity {
  constructor (values) {
    this._defineProperties()

    const instance = (values instanceof Sequelize.Instance) ? values : this.Model.build(this._sanitize(values))

    Object.defineProperty(this, '_instance', {
      value: instance,
      enumerable: false,
      writable: false,
      configurable: false
    })
  }

  static $ (property, descriptor) {
    this._processDescriptor(property, descriptor)
  }

  static _processDescriptor (property, descriptor) {
    this.prototype._descriptors[property] = descriptor || {}

    const d = {
      accessor: property,
      enumerable: true,
      configurable: true,
      get: function () { return this._instance.get(property) },
      set: function (value) { this._instance.set(property, value) }
    }

    if (descriptor) {
      if (descriptor.private) {
        d.enumerable = false
        d.accessor = ensureUnderscore(property)
      }

      if (descriptor.readOnly) {
        delete d.set
      }
    }

    this.prototype._propertyDescriptors[property] = d
  }

  static get Repository () { throw new NotImplementedError('Repository static getter must be overridden by subclasses.') }

  get Model () { throw new NotImplementedError('Model getter must be overridden by subclasses.') }

  _defineProperties () {
    for (let p in this._descriptors) {
      let descriptor = this._propertyDescriptors[p]
      Object.defineProperty(this, descriptor.accessor, descriptor)
    }
  }

  _get (property) {
    return this._instance.get(property)
  }

  _set (property, value, force) {
    if (this._descriptors.hasOwnProperty(property)) {
      if (this._descriptors[property].readOnly ? force : true) {
        this._instance.set(property, value)
        return true
      }
    }
    return false
  }

  _sanitize (values) {
    if (values) {
      for (let p in values) {
        if (this._descriptors[p] && this._descriptors[p].private) {
          delete values[p]
        }
      }
    }
    return values
  }

  merge (values) {
    if (values) {
      for (let p in values) {
        if (this._descriptors[p] && !this._descriptors[p].private) {
          this._set(p, values[p])
        }
      }
    }
    return this
  }

  update (values) {
    if (values) {
      for (let p in this._descriptors) {
        if (!this._descriptors[p].private) {
          this._set(p, values.hasOwnProperty(p) ? values[p] : null)
        }
      }
    }
    return this
  }
}

Object.defineProperty(Entity.prototype, '_descriptors', {
  value: {},
  enumerable: false,
  configurable: false,
  writable: false
})

Object.defineProperty(Entity.prototype, '_propertyDescriptors', {
  value: {},
  enumerable: false,
  configurable: false,
  writable: false
})

Entity.$('id', { readOnly: true })
Entity.$('createdAt', { readOnly: true })
Entity.$('updatedAt', { readOnly: true })

function ensureUnderscore (str) {
  return (str && str[0] !== '_') ? '_' + str : str
}
