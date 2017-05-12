const assert = require('assert')

class EntityMetadata {
  constructor (properties, parentMetadata) {
    // init properties with parent's if it exists
    const props = parentMetadata && parentMetadata instanceof EntityMetadata
      ? Object.assign({}, parentMetadata.properties)
      : {}

    Object.defineProperty(this, 'properties', {
      value: props,
      configurable: false,
      writable: false
    })

    for (let p in properties) {
      processDescriptor(this, p, properties[p])
    }

    Object.defineProperty(this, 'names', {
      value: Object.keys(this.properties),
      configurable: false,
      writable: false
    })
  }

  isComputed (property) {
    return this.properties[property].computed != null
  }

  isDefault (property) {
    return this.properties[property].value != null
  }

  isDefaultReadOnly (property) {
    return this.properties[property].readOnly === true &&
      this.properties[property].value != null
  }

  isNotifiable (property) {
    return this.properties[property].notify === true
  }

  isReadOnly (property) {
    return this.properties[property].readOnly === true
  }

  isPrivate (property) {
    return this.properties[property].private === true
  }

  getAccessor (property) {
    return this.properties[property].accessor
  }

  getComputedFunction (property) {
    return this.properties[property].computed
  }

  getDefaultValue (property) {
    return this.properties[property].value
  }

  getDependencies (property) {
    return this.properties[property].dependencies
  }

  getDescriptor (property) {
    return this.properties[property].descriptor
  }

  getProperties () {
    return this.names
  }

  hasProperty (property) {
    return this.properties.hasOwnProperty(property)
  }

  getType (property) {
    return this.properties[property].type
  }

  getGenericType (property) {
    return this.properties[property].genericType
  }

  // getListener (property) {
  //   if (!this.properties[property].listener && this.isComputed(property)) {
  //     this.properties[property].listener = this._createListener(property)
  //   }
  //
  //   return this.properties[property].listener
  // }

  createListener (property) {
    const computeValue = this.getComputedFunction(property)
    const dependencies = this.getDependencies(property)

    return function () {
      const depValues = []

      for (let dep of dependencies) {
        const depValue = this._get(dep)

        // computed function is only called if all dependencies are set
        if (depValue === undefined) return

        depValues.push(depValue)
      }

      // this references entity instance
      this.__set(property, computeValue(...depValues))
    }
  }
}

function processDescriptor (meta, propName, propMetadata) {
  assert(propMetadata != null, 'metadata cannot be null')

  // check for type alias metadata
  if (typeof propMetadata === 'function' || propMetadata instanceof Array) {
    propMetadata = { type: propMetadata }
  }

  // check for array with generic type
  if (propMetadata.type instanceof Array) {
    propMetadata.genericType = propMetadata.type[0]
    propMetadata.type = Array
  }

  // merge current metadata with parent's
  meta.properties[propName] =
    Object.assign(propMetadata, meta.properties[propName])

  // accessor will be the actual property name in the instance;
  // if private, it will hold an underscore in the beginning
  propMetadata.accessor = propName

  const d = getDefaultDescriptor(propName)

  if (propMetadata.private) {
    d.enumerable = false
    propMetadata.accessor = ensureUnderscore(propName)
  }

  if (propMetadata.computed) {
    assertComputedIsFunction(propName, propMetadata)

    const dependencies = getFunctionArgs(propMetadata.computed)
    for (let dependency of dependencies) {
      assertDependencyExists(meta, propName, dependency)
      meta.properties[dependency].notify = true
    }
    meta.properties[propName].dependencies = dependencies

    // d.get = getComputedGetter()

    // readOnly by default when computed
    propMetadata.readOnly = true
  }

  if (propMetadata.readOnly) {
    delete d.set
  }

  meta.properties[propName].descriptor = d
}

function getDefaultDescriptor (propName) {
  return {
    enumerable: true,
    configurable: true,
    get: function () { return this._holder.get(propName) },
    set: function (value) { this.__set(propName, value) }
  }
}

// function getComputedGetter () {
//   // a computed getter ensures it has been initialized
//   return () => {
//     const value = this._holder.get(property)
//     if (value !== undefined) return value
//
//     // compute value if property has not been initialized yet
//     this._changeListeners[property]()
//
//     return this._holder.get(property)
//   }
// }

function assertComputedIsFunction (propName, propMetadata) {
  assert(typeof propMetadata.computed === 'function',
    `${propName}'s "computed" must be a function`)
}

function assertDependencyExists (meta, propName, depName) {
  assert(meta.properties.hasOwnProperty(depName),
    `argument "${depName}" in ${propName}'s computed function could not be ` +
    `resolved. Please make sure the property "${depName}" is declared before ` +
    `"${propName}" in the Entity properties getter.`)
}

function ensureUnderscore (str) {
  return (str && str[0] !== '_') ? '_' + str : str
}

const STRIP_COMMENTS = /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/mg
const ARGUMENT_NAMES = /([^\s,]+)/g
function getFunctionArgs (func) {
  let fnStr = func.toString().replace(STRIP_COMMENTS, '')
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .match(ARGUMENT_NAMES)

  return result === null ? [] : result
}

module.exports = EntityMetadata
