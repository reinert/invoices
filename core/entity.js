const Holder = require('./holder')

class Entity {
  constructor (values) {
    const holder = isHolder(values)
      ? values
      : new Holder(this._sanitize(values))

    Object.defineProperty(this, '_holder', {
      value: holder,
      enumerable: false,
      writable: true,
      configurable: true
    })

    this._defineProperties()
  }

  static $ (property, descriptor) {
    this._processDescriptor(property, descriptor)
  }

  static _processDescriptor (property, descriptor) {
    this.prototype._descriptors[property] =
      Object.assign(descriptor || {}, this.prototype._descriptors[property])

    const d = {
      accessor: property,
      enumerable: true,
      configurable: true,
      get: function () { return this._holder.get(property) },
      set: function (value) { this._holder.set(property, value) }
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

  _defineProperties () {
    for (let p in this._descriptors) {
      let descriptor = this._propertyDescriptors[p]
      // set property descriptor in this instance
      Object.defineProperty(this, descriptor.accessor, descriptor)
      // set default value if necessary
      if (this._descriptors[p].value != null) {
        this._holder.set(p, this._descriptors[p].value)
      }
    }
  }

  _get (property) {
    return this._holder.get(property)
  }

  _set (property, value, force) {
    if (this._descriptors.hasOwnProperty(property)) {
      if (this._descriptors[property].readOnly ? force : true) {
        this._holder.set(property, value)
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

// Holder duck type check
function isHolder (obj) {
  return typeof obj.set === 'function' && typeof obj.get === 'function'
}

module.exports = Entity
