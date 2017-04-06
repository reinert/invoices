const Holder = require('./holder')

class Entity {
  constructor (values) {
    this._initHolder(values || {})
    this._initProperties()
  }

  static $ (propertyDescriptorsMap) {
    const proto = Object.getPrototypeOf(this)

    Object.defineProperty(this, '_descriptors', {
      value: Object.assign({}, proto._descriptors),
      enumerable: false,
      configurable: false,
      writable: false
    })

    Object.defineProperty(this, '_propertyDescriptors', {
      value: Object.assign({}, proto._propertyDescriptors),
      enumerable: false,
      configurable: false,
      writable: false
    })

    for (let p in propertyDescriptorsMap) {
      this._processDescriptor(p, propertyDescriptorsMap[p])
    }
  }

  static _processDescriptor (property, descriptor) {
    this._descriptors[property] =
      Object.assign(descriptor || {}, this._descriptors[property])

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

    this._propertyDescriptors[property] = d
  }

  _initHolder (values) {
    const holder = isHolder(values)
      ? values
      : new Holder(this._sanitize(values))

    Object.defineProperty(this, '_holder', {
      value: holder,
      enumerable: false,
      writable: true,
      configurable: true
    })
  }

  _initProperties () {
    for (let p in this.constructor._descriptors) {
      let descriptor = this.constructor._propertyDescriptors[p]
      // set property descriptor in this instance
      Object.defineProperty(this, descriptor.accessor, descriptor)
      // set default value if necessary
      if (this.constructor._descriptors[p].value != null) {
        this._holder.set(p, this.constructor._descriptors[p].value)
      }
    }
  }

  _get (property) {
    return this._holder.get(property)
  }

  _set (property, value, force) {
    if (this.constructor._descriptors.hasOwnProperty(property)) {
      if (this.constructor._descriptors[property].readOnly ? force : true) {
        this._holder.set(property, value)
        return true
      }
    }
    return false
  }

  _sanitize (values) {
    if (values) {
      for (let p in values) {
        if (this.constructor._descriptors[p] &&
            (this._isPrivate(p) || this._isDefaultReadOnly(p))) {
          delete values[p]
        }
      }
    }
    return values
  }

  _isPrivate (property) {
    return this.constructor._descriptors[property].private === true
  }

  _isDefaultReadOnly (property) {
    return this.constructor._descriptors[property].readOnly === true &&
      this.constructor._descriptors[property].value != null
  }

  merge (values) {
    if (values) {
      for (let p in values) {
        if (this.constructor._descriptors[p] &&
            !this.constructor._descriptors[p].private) {
          this._set(p, values[p])
        }
      }
    }
    return this
  }

  update (values) {
    if (values) {
      for (let p in this.constructor._descriptors) {
        if (!this.constructor._descriptors[p].private) {
          this._set(p, values.hasOwnProperty(p) ? values[p] : null)
        }
      }
    }
    return this
  }
}

Entity.$({
  'id': { readOnly: true },
  'createdAt': { readOnly: true },
  'updatedAt': { readOnly: true }
})

function ensureUnderscore (str) {
  return (str && str[0] !== '_') ? '_' + str : str
}

// Holder duck type check
function isHolder (obj) {
  return typeof obj.set === 'function' && typeof obj.get === 'function'
}

module.exports = Entity
