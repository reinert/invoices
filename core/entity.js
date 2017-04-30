const assert = require('assert')
const EventEmitter = require('events')
const Holder = require('./holder')
const LeanEventEmitter = require('./lean-event-emitter')

class Entity extends EventEmitter {
  constructor (values) {
    super()
    this.constructor.initEntity()
    this.__initHolder(values || {})
    this.__initProperties()
  }

  static get properties () {
    return {
      'id': {
        type: Number,
        readOnly: true
      },
      'createdAt': {
        type: Date,
        readOnly: true
      },
      'updatedAt': {
        type: Date,
        readOnly: true
      }
    }
  }

  /**
   * Initializes an Entity with properties and their descriptors.
   * It must be called only once, after inheritor class declaration.
   *
   * It accepts a dict in the following form:
   *
   *   {
   *     'propA': { \/* propA descriptors *\/ },
   *     ...
   *     'propN': { \/* propN descriptors *\/ }
   *   }
   *
   * Valid descriptor's attributes are:
   *   # {function} type - the type of the property.
   *   # {function} subType - the type of the items of a collection property.
   *   # {boolean} private - when true, the property is only accessible
   *                         with an underline before, e.g.: inst._privProp;
   *                         also it cannot be written in construction.
   *   # {boolean} readOnly - when true, the property silently fails to write,
   *                          e.g.: inst.ronlyProp = 'a' --> do nothing;
   *                          still it can be written in construction;
   *                          additionally its possible to write over it
   *                          using {@link _set} with force = true.
   *   # {boolean} notify - when true, a change event named '{property}Changed'
   *                        is fired whenever the property is changed.
   *   # {*} value - the default value of the property; when set along with
   *                 readOnly as true, it cannot be written in construction.
   *   # {function} computed - defines a property that performs some computation
   *                           upon previously declared properties. The
   *                           arguments' names must be equal to the properties'
   *                           names in which the function depends.
   *
   * @see {@link _set}
   * @typedef {object.<string, *>} descriptor
   * @param {object.<string, descriptor>} propertyDescriptorDict
   */
  static initEntity () {
    if (this.hasOwnProperty('_descriptors')) return

    const proto = Object.getPrototypeOf(this)

    if (!proto.hasOwnProperty('_descriptors') &&
        proto.prototype instanceof Entity) {
      proto.initEntity()
    }

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

    for (let p in this.properties) {
      this.__processDescriptor(p, this.properties[p])
    }
  }

  static __processDescriptor (property, descriptor) {
    assert(descriptor != null, 'descriptor cannot be null')

    // Check for type alias descriptor
    if (typeof descriptor === 'function') descriptor = { type: descriptor }

    this._descriptors[property] =
      Object.assign(descriptor, this._descriptors[property])

    const d = {
      accessor: property,
      enumerable: true,
      configurable: true,
      get: function () { return this._holder.get(property) },
      set: function (value) { this.__set(property, value) }
    }

    if (descriptor.private) {
      d.enumerable = false
      d.accessor = ensureUnderscore(property)
    }

    if (descriptor.computed) {
      assert(typeof descriptor.computed === 'function',
        `${property}'s "computed" must be a function`)

      const args = getArgNames(descriptor.computed)
      for (let p of args) {
        assert(this._descriptors.hasOwnProperty(p),
          `argument "${p}" in ${property}'s computed function could not be ` +
          `resolved. Please make sure the property "${p}" is declared before ` +
          `"${property}" in the Entity initialization.`)
      }
      descriptor._events = args

      // a computed getter ensures it has been initialized
      d.get = function () {
        const value = this._holder.get(property)
        if (value !== undefined) return value

        // compute value if property has not been initialized yet
        const listeners = this._propertyChangeHandlers.getListeners(args[0])
        if (listeners.length > 0) listeners[0]()

        return this._holder.get(property)
      }

      // readOnly by default when computed
      descriptor.readOnly = true
    }

    if (descriptor.readOnly) {
      delete d.set
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
      const d = this.constructor._descriptors[property]
      if (!d.computed && (d.readOnly ? force : true)) {
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
    this._propertyChangeHandlers.emit(property, newValue, oldValue)
    if (this.constructor._descriptors[property].notify) {
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

  __initProperties () {
    this._propertyChangeHandlers = new LeanEventEmitter()

    for (let p in this.constructor._descriptors) {
      let descriptor = this.constructor._descriptors[p]
      let d = this.constructor._propertyDescriptors[p]

      // set property descriptor in this instance
      Object.defineProperty(this, d.accessor, d)

      // set computed properties
      let allDepSet = true // flag to check if default value should be set
      if (descriptor.hasOwnProperty('computed')) {
        const listener = () => {
          const depValues = []
          for (let e of descriptor._events) {
            const eValue = this._get(e)
            // computed function is only called if all dependencies are set
            if (eValue === undefined) return

            depValues.push(eValue)
          }

          this.__set(p, descriptor.computed(...depValues))
        }

        for (let e of descriptor._events) {
          this._propertyChangeHandlers.on(e, listener)
          allDepSet &= this._get(e) !== undefined
        }

        // set computed default value on construction if dependencies are set
        if (allDepSet) listener()
      }

      // set default value if necessary
      if (descriptor.value != null) {
        this.__set(p, descriptor.value)
      }
    }
  }

  __sanitize (values) {
    if (values) {
      const sanitized = {}
      for (let p in values) {
        if (this.constructor._descriptors[p]) {
          if (!(this.__isPrivate(p) || this.__isDefaultReadOnly(p))) {
            sanitized[p] = this.__coerce(p, values[p])
          }
        }
      }
      values = sanitized
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

  __coerce (property, value) {
    const type = this.constructor._descriptors[property].type
    const subType = this.constructor._descriptors[property].subType
    return this._coerce(value, type, subType)
  }

  _coerce (value, Type, SubType) {
    if (value == null) return value

    switch (Type) {
      case String: {
        if (!(typeof value === 'string' || value instanceof String)) {
          return value + ''
        }

        return value
      }
      case Number: {
        if (!(typeof value === 'number' || value instanceof Number)) {
          return Number.isInteger(value)
            ? Number.parseInt(value)
            : Number.parseFloat(value)
        }

        return value
      }
      case Boolean: {
        if (!(typeof value === 'boolean' || value instanceof Boolean)) {
          return !!value
        }

        return value
      }
      case Date: {
        if (!(value instanceof Date)) {
          return new Date(value)
        }

        return value
      }
      case Array: {
        if (!Array.isArray(value)) {
          throw new TypeError(
            `${value} is of type ${typeof value}. It must be an array.`)
        }

        if (SubType != null) {
          if (value.length > 0 && !(value[0] instanceof SubType)) {
            for (let i = 0; i < value.length; ++i) {
              value[i] = this._coerce(value[i], SubType)
            }
          }
          const self = this
          value = new Proxy(value, {
            set (target, key, value) {
              if (!isNaN(parseFloat(key)) && isFinite(key)) {
                if (!(value instanceof SubType)) {
                  value = self._coerce(value, SubType)
                }
              }
              return Reflect.set(target, key, value)
            }
          })
        }

        return value
      }
      default: {
        // TODO: register observers (either single object or arrays)
        return value instanceof Type ? value : new Type(value)
      }
    }
  }
}

Entity.initEntity()

function ensureUnderscore (str) {
  return (str && str[0] !== '_') ? '_' + str : str
}

// Holder duck type check
function isHolder (obj) {
  return typeof obj.set === 'function' && typeof obj.get === 'function'
}

const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg
const ARGUMENT_NAMES = /([^\s,]+)/g
function getArgNames (func) {
  let fnStr = func.toString().replace(STRIP_COMMENTS, '')
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(ARGUMENT_NAMES)
  return result === null ? [] : result
}

module.exports = Entity
