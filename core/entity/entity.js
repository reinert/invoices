const EventEmitter = require('events')
const Coercer = require('./coercer')
const EntityMetadata = require('./entity-metadata')
const Holder = require('./holder')

class Entity extends EventEmitter {
  static coerce (value, type, genericType) {
    return this.coercer.coerce(value, type, genericType)
  }

  constructor (values) {
    super()
    this.__initHolder(values || {})
    processConstructor(this.constructor)
    processInstance(this)
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
        if (this.__propertyExists(p) &&
            !this.__isPrivate(p)) {
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
      for (let p of this.__properties()) {
        if (!this.__isPrivate(p)) {
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
    if (this.__propertyExists(property)) {
      if (!this.__isComputed(property) &&
          (this.__isReadOnly(property) ? force : true)) {
        this.__set(property, value)
        return true
      }
    }
    return false
  }

  __set (property, value) {
    const newValue = this.__coerce(property, value)
    const oldValue = this._holder.get(property)
    this._holder.set(property, newValue)
    if (this.__mustNotify(property)) {
      this.emit(`${property}Changed`, newValue, oldValue)
    }
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

  __sanitize (values) {
    if (values) {
      const sanitized = {}
      for (let p in values) {
        if (this.__propertyExists(p)) {
          if (!(this.__isPrivate(p) || this.__isDefaultReadOnly(p))) {
            sanitized[p] = this.__coerce(p, values[p])
          }
        }
      }
      values = sanitized
    }
    return values
  }

  __mustNotify (property) {
    return this.constructor.metadata.isNotifiable(property)
  }

  __isPrivate (property) {
    return this.constructor.metadata.isPrivate(property)
  }

  __isReadOnly (property) {
    return this.constructor.metadata.isReadOnly(property)
  }

  __isComputed (property) {
    return this.constructor.metadata.isComputed(property)
  }

  __isDefaultReadOnly (property) {
    return this.constructor.metadata.isDefaultReadOnly(property)
  }

  __propertyExists (property) {
    return this.constructor.metadata.hasProperty(property)
  }

  __properties () {
    return this.constructor.metadata.getProperties()
  }

  __coerce (property, value) {
    const type = this.constructor.metadata.getType(property)
    const genericType = this.constructor.metadata.getGenericType(property)
    return this.constructor.coerce(value, type, genericType)
  }
}

processConstructor(Entity)

Object.defineProperty(Entity, 'coercer', {
  value: new Coercer(),
  enumerable: false,
  writable: true,
  configurable: true
})

// Holder duck type check
function isHolder (obj) {
  return typeof obj.set === 'function' && typeof obj.get === 'function'
}

function processConstructor (entityCtor) {
  if (entityCtor.hasOwnProperty('metadata')) return

  const proto = Object.getPrototypeOf(entityCtor)

  if (proto.prototype instanceof Entity && !proto.hasOwnProperty('metadata')) {
    processConstructor(proto)
  }

  Object.defineProperty(entityCtor, 'metadata', {
    value: new EntityMetadata(entityCtor.properties, proto.metadata),
    enumerable: false,
    configurable: false,
    writable: false
  })
}

function processInstance (entity) {
  const meta = entity.constructor.metadata

  for (let p of meta.getProperties()) {
    // set property descriptor in this instance
    Object.defineProperty(entity, meta.getAccessor(p), meta.getDescriptor(p))

    // set computed properties
    if (meta.isComputed(p)) {
      const listener = meta.createListener(p)
      for (let dep of meta.getDependencies(p)) {
        entity.on(`${dep}Changed`, listener)
      }
      // set computed value on construction if dependencies are set
      listener.call(entity)
    }

    // set default value if necessary
    if (meta.isDefault(p)) {
      entity.__set(p, meta.getDefaultValue(p))
    }
  }
}

module.exports = Entity
