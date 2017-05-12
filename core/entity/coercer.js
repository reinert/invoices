class Coercer {
  constructor (strict = false) {
    this.strict = strict
  }

  coerce (value, Type, GenericType) {
    if (value == null) return value

    switch (Type) {
      case String: return this.toString(value)
      case Number: return this.toNumber(value)
      case Boolean: return this.toBoolean(value)
      case Date: return this.toDate(value)
      case Array: return this.toArray(value, GenericType)
      default: return this.toType(Type, value)
    }
  }

  toArray (value, GenericType) {
    if (!Array.isArray(value)) throw new TypeError(`${value} is not an array`)

    if (GenericType != null) {
      // ensure all items in the array are coerced
      if (value.length > 0 && !(value[0] instanceof GenericType)) {
        for (let i = 0; i < value.length; ++i) {
          value[i] = this.coerce(value[i], GenericType)
        }
      }

      // proxy the array to ensure the items in the array will be coerced
      const self = this
      value = new Proxy(value, {
        set (target, key, value) {
          if (typeof key === 'number' || isNumeric(key)) {
            if (!(value instanceof GenericType)) {
              value = self.coerce(value, GenericType)
            }
          }

          return Reflect.set(target, key, value)
        }
      })
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

  toType (Type, value) {
    // TODO: register observers (either single object or arrays)
    if (!(value instanceof Type)) {
      if (this.strict) throw new TypeError(`"${value}" is not a ${Type.name}`)
      value = new Type(value)
    }

    return value
  }
}

function isNumeric (value) {
  return !isNaN(parseFloat(value)) && isFinite(value)
}

module.exports = Coercer
