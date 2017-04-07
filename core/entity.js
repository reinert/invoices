const assert = require('assert')
const Holder = require('./holder')

class Entity {
  constructor (values) {
    this.__initHolder(values || {})
    this.__initProperties()
  }

  /**
   *  Initializes an Entity with properties and their descriptors.
   *  It must be called only once, after inheritor class declaration.
   *
   *  It accepts a dict in the following form:
   *
   *    {
   *      'propA': { \/* propA descriptors *\/ },
   *      ...
   *      'propN': { \/* propN descriptors *\/ }
   *    }
   *
   *  Valid descriptor's attributes are:
   *    # {boolean} private - when true, the property is only accessible
   *                          with an underline before, e.g.: inst._privProp;
   *                          also it cannot be written in construction.
   *    # {boolean} readOnly - when true, the property silently fails to write,
   *                           e.g.: inst.ronlyProp = 'a' --> do nothing;
   *                           still it can be written in construction.
   *    # {*} value - the default value of the property; when set along with
   *                  readOnly as true, it cannot be written in construction.
   *
   * @typedef {object.<string, *>} descriptor
   * @param {object.<string, descriptor>} propertyDescriptorDict
   */
  static $ (propertyDescriptorDict) {
    console.dir(this.hasOwnProperty('_descriptors'))
    assert(!this.hasOwnProperty('_descriptors'),
      'Entity Inheritor already initialized. $ must be called only once.')

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

    for (let p in propertyDescriptorDict) {
      this.__processDescriptor(p, propertyDescriptorDict[p])
    }
  }

  static __processDescriptor (property, descriptor) {
    assert(descriptor != null, 'descriptor cannot be null')

    this._descriptors[property] =
      Object.assign(descriptor, this._descriptors[property])

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

  /**
   * Merges the given object with this instance.
   * Missing properties in the given object will not affect the respective
   * properties in this instance.
   *
   * @param {object} values
   * @returns {Entity} this
   */
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

  /**
   * Updates all the instance's values with the given object.
   * If there are missing properties in the given object, then tey will be set
   * to null in this instance.
   *
   * @param {object} values
   * @returns {Entity} this
   */
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

  /**
   * Gets the value of the given property.
   *
   * @param {string} property
   * @returns {*} property's value
   * @protected
   */
  _get (property) {
    return this._holder.get(property)
  }

  /**
   * Assigns a new value to a property.
   * ReadOnly properties can be written if force is true.
   *
   * @param {string} property - the property to assign a new value
   * @param {*} value - the new value to assign to the property
   * @param {boolean} [force] - true if writing a readOnly property is desired
   * @returns {boolean} true if the property's value changed; false otherwise
   * @protected
   */
  _set (property, value, force) {
    if (this.constructor._descriptors.hasOwnProperty(property)) {
      if (this.constructor._descriptors[property].readOnly ? force : true) {
        this._holder.set(property, value)
        return true
      }
    }
    return false
  }

  __initHolder (values) {
    const holder = isHolder(values)
      ? values
      : new Holder(this.__sanitize(values))

    Object.defineProperty(this, '_holder', {
      value: holder,
      enumerable: false,
      writable: true,
      configurable: true
    })
  }

  __initProperties () {
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

  __sanitize (values) {
    if (values) {
      for (let p in values) {
        if (this.constructor._descriptors[p] &&
            (this.__isPrivate(p) || this.__isDefaultReadOnly(p))) {
          delete values[p]
        }
      }
    }
    return values
  }

  __isPrivate (property) {
    return this.constructor._descriptors[property].private === true
  }

  __isDefaultReadOnly (property) {
    return this.constructor._descriptors[property].readOnly === true &&
      this.constructor._descriptors[property].value != null
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
