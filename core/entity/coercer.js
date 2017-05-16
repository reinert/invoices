class Coercer {
  constructor (strict = false) {
    this.strict = strict
  }

  coerce (value, Type, options = {}) {
    if (value == null) return value

    switch (Type) {
      case String: return this.toString(value)
      case Number: return this.toNumber(value)
      case Boolean: return this.toBoolean(value)
      case Date: return this.toDate(value)
      case Array: return this.toArray(value, options)
      default: return this.toType(Type, value, options)
    }
  }

  toArray (value, options) {
    if (!Array.isArray(value)) throw new TypeError(`${value} is not an array`)

    const GenericType = options.genericType
    const itemObserver = options.itemObserver
    const arrayObserver = options.arrayObserver
    const skipInsert = options.skipNotification

    if (GenericType != null) {
      // ensure all items in the array are coerced
      for (let i = 0; i < value.length; ++i) {
        // coerce and register deep observers
        value[i] = this.coerce(value[i], GenericType, {
          itemObserver: itemObserver,
          skipNotification: skipInsert
        })

        // trigger insert observer if necessary on construction
        if (skipInsert !== true && arrayObserver) {
          arrayObserver.insert(value[i])
        }
      }

      // proxy the array to ensure the items in the array will be coerced
      const self = this

      if (arrayObserver) {
        value = new Proxy(value, {
          deleteProperty (target, property) {
            if (typeof property === 'number' || isNumeric(property)) {
              const deleted = target[property]

              const result = Reflect.set(target, property, value)

              // trigger delete observer
              arrayObserver.delete(deleted)

              return result
            }

            return Reflect.set(target, property, value)
          },

          set (target, property, value) {
            if (typeof property === 'number' || isNumeric(property)) {
              // coerce value and register observers
              value = self.coerce(value, GenericType, { itemObserver })

              const deleted = target[property]

              const result = Reflect.set(target, property, value)

              // trigger delete observer if there's an item in the position
              if (deleted !== undefined) {
                arrayObserver.delete(deleted)
              }

              // trigger insert observer
              arrayObserver.insert(value)

              return result
            }

            return Reflect.set(target, property, value)
          }
        })
      } else {
        value = new Proxy(value, {
          set (target, key, value) {
            if (typeof key === 'number' || isNumeric(key)) {
              // coerce value and register observers
              value = self.coerce(value, GenericType, { itemObserver })
            }

            return Reflect.set(target, key, value)
          }
        })
      }
    } else {
      if (arrayObserver) {
        // trigger insert observer if necessary on construction
        if (skipInsert !== true) {
          for (let i = 0; i < value.length; ++i) {
            arrayObserver.insert(value[i])
          }
        }

        value = new Proxy(value, {
          deleteProperty (target, property) {
            if (typeof property === 'number' || isNumeric(property)) {
              const deleted = target[property]

              const result = Reflect.set(target, property, value)

              // trigger delete observer
              arrayObserver.delete(deleted)

              return result
            }

            return Reflect.set(target, property, value)
          },

          set (target, property, value) {
            if (typeof property === 'number' || isNumeric(property)) {
              const deleted = target[property]

              const result = Reflect.set(target, property, value)

              // trigger delete observer if there's an item in the position
              if (deleted !== undefined) {
                arrayObserver.delete(deleted)
              }

              // trigger insert observer
              arrayObserver.insert(value)

              return result
            }

            return Reflect.set(target, property, value)
          }
        })
      }
    }

    return value
  }

  toBoolean (value) {
    if (!(typeof value === 'boolean' || value instanceof Boolean)) {
      if (this.strict) throw new TypeError(`"${value}" is not a boolean`)
      return !!value
    }

    return value
  }

  toDate (value) {
    if (!(value instanceof Date)) {
      if (this.strict) throw new TypeError(`"${value}" is not a Date`)
      return new Date(value)
    }

    return value
  }

  toNumber (value) {
    if (!(typeof value === 'number' || value instanceof Number)) {
      if (this.strict) throw new TypeError(`"${value}" is not a number`)
      return Number.isInteger(value) ? parseInt(value) : parseFloat(value)
    }

    return value
  }

  toString (value) {
    if (!(typeof value === 'string' || value instanceof String)) {
      if (this.strict) throw new TypeError(`"${value}" is not a string`)
      return value + ''
    }

    return value
  }

  toType (Type, value, options) {
    if (value instanceof Type) {
      if (options.itemObserver) value._bindObservers(options.itemObserver)
    } else {
      if (this.strict) throw new TypeError(`"${value}" is not a ${Type.name}`)
      value = new Type(value, options)
    }

    return value
  }
}

function isNumeric (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

module.exports = Coercer
