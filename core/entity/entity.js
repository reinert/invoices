const EventEmitter = require('events')
const Coercer = require('./coercer')
const EntityMetadata = require('./entity-metadata')
const Holder = require('./holder')

class Entity extends EventEmitter {
  static coerce (value, type, options) {
    if (typeof type === 'string') {
      // type argument is actually a property of this Entity
      type = this.metadata.getType(type)
    }

    return this.coercer.coerce(value, type, options)
  }

  constructor (values = {}, options = {}) {
    super()
    processConstructor(this.constructor)
    processInstance(this, values, options)
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

  _bindObservers (itemObserver = {}) {
    for (let p in itemObserver) {
      if (this.__propertyExists(p)) this.on(`${p}Changed`, itemObserver[p])
    }
  }

  __set (property, value, options = {}) {
    const newValue = this.__coerce(property, value,
      { skipNotification: options.isDefault })
    const oldValue = this._holder.get(property)

    if (newValue === oldValue) return
    this._holder.set(property, newValue)
    const skipNotification = options.skipNotification || options.isDefault
    if (this.__mustNotify(property) && !skipNotification) {
      this.emit(`${property}Changed`, newValue, oldValue)
    }
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

  __coerce (property, value, options) {
    const type = this.constructor.metadata.getType(property)
    const genericType = this.constructor.metadata.getGenericType(property)
    const itemObserver = this._observers.item[property]
    const arrayObserver = this._observers.array[property]
    const skipNotification = options.skipNotification
    return this.constructor.coerce(value, type, {
      genericType, itemObserver, arrayObserver, skipNotification
    })
  }
}

processConstructor(Entity)

Object.defineProperty(Entity, 'coercer', {
  value: new Coercer(),
  enumerable: false,
  writable: true,
  configurable: true
})

function processConstructor (entityCtor) {
  if (entityCtor.hasOwnProperty('metadata')) return

  const proto = Object.getPrototypeOf(entityCtor)

  if (proto.prototype instanceof Entity && !proto.hasOwnProperty('metadata')) {
    processConstructor(proto)
  }

  Object.defineProperty(entityCtor, 'metadata', {
    value: new EntityMetadata(entityCtor, proto.metadata),
    enumerable: false,
    configurable: false,
    writable: false
  })
}

function processInstance (entity, values, options) {
  const meta = entity.constructor.metadata
  const isValuesHolder = isHolder(values)

  Object.defineProperties(entity, {
    'domain': { enumerable: false },
    '_events': { enumerable: false },
    '_eventsCount': { enumerable: false },
    '_maxListeners': { enumerable: false }
  })

  Object.defineProperty(entity, '_holder', {
    value: isValuesHolder ? values : new Holder(),
    enumerable: false,
    writable: true,
    configurable: false
  })

  Object.defineProperty(entity, '_observers', {
    value: {
      item: {},
      array: {}
    },
    enumerable: false,
    writable: false,
    configurable: false
  })

  for (let p of meta.getProperties()) {
    // set property descriptor in this instance
    Object.defineProperty(entity, meta.getAccessor(p), meta.getDescriptor(p))

    // set external observer
    const itemObserver = options.itemObserver
    if (itemObserver && itemObserver.hasOwnProperty(p)) {
      entity.on(`${p}Changed`, itemObserver[p])
    }

    // set observer
    if (meta.hasObserver(p)) {
      entity.on(`${p}Changed`, entity[meta.getObserver(p)])
    }

    // set item observer
    if (meta.hasItemObserver(p)) {
      entity._observers.item[p] =
        Object.entries(meta.getItemObserver(p)).reduce((prev, curr) => {
          prev[curr[0]] = entity[curr[1]].bind(entity)
          return prev
        }, {})
    }

    // set array observer
    if (meta.hasArrayObserver(p)) {
      entity._observers.array[p] =
        Object.entries(meta.getArrayObserver(p)).reduce((prev, curr) => {
          prev[curr[0]] = entity[curr[1]].bind(entity)
          return prev
        }, {})
    }

    // set computed properties
    if (meta.isComputed(p)) {
      const listener = meta.createListener(p)
      for (let dep of meta.getDependencies(p)) {
        entity.on(`${dep}Changed`, listener)
      }

      // set computed value on construction if dependencies are set
      listener.call(entity, { skipNotification: true })
    }

    // set default value if necessary
    if (meta.isDefault(p)) {
      if (!isValuesHolder || entity._get(p) === undefined) {
        entity.__set(p, meta.getDefaultValue(p), { isDefault: true })
      }
    }

    // set the values passed in constructor when appropriate
    if (!isValuesHolder && values.hasOwnProperty(p) &&
      !(entity.__isPrivate(p) || entity.__isDefaultReadOnly(p))) {
      entity.__set(p, values[p], options)
    }

    if (isValuesHolder && values.get(p) !== undefined) {
      // ensure values in holder are coerced
      const v = entity.__coerce(p, values.get(p), { skipNotification: true })
      values.set(p, v)
    }
  }
}

// Holder duck type check
function isHolder (obj) {
  return typeof obj.set === 'function' && typeof obj.get === 'function'
}

module.exports = Entity
