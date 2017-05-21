const assert = require('assert')
const EventEmitter = require('events')

class EntityMetadata {
  constructor (entityCtor, parentMetadata) {
    Object.defineProperty(this, 'entityCtor', {
      value: entityCtor,
      configurable: false,
      writable: false
    })

    // init properties with parent's if it exists
    const props = parentMetadata && parentMetadata instanceof EntityMetadata
      ? Object.assign({}, parentMetadata.properties)
      : {}

    Object.defineProperty(this, 'properties', {
      value: props,
      configurable: false,
      writable: false
    })

    const properties = entityCtor.properties
    for (let p in properties) {
      processDescriptor(this, p, properties[p])
    }

    Object.defineProperty(this, 'propNames', {
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
    return typeof this.properties[property].value === 'function'
      ? this.properties[property].value()
      : this.properties[property].value
  }

  getDependencies (property) {
    return this.properties[property].dependencies
  }

  getDescriptor (property) {
    return this.properties[property].descriptor
  }

  getProperties () {
    return this.propNames
  }

  hasProperty (property) {
    return this.properties.hasOwnProperty(property)
  }

  getType (property) {
    return this.properties[property].type
  }

  isTypeEntity (property) {
    return this.properties[property].type.prototype instanceof EventEmitter
  }

  getGenericType (property) {
    return this.properties[property].genericType
  }

  isArrayTypeWithGenericEntity (property) {
    if (this.properties[property].type !== Array ||
      this.properties[property].genericType == null) return false
    return this.properties[property].genericType.prototype instanceof EventEmitter
  }

  isGenericTypeEntity (property) {
    if (!this.properties[property].genericType) return false
    return this.properties[property].genericType.prototype instanceof EventEmitter
  }

  hasObserver (property) {
    return this.properties[property].hasOwnProperty('observer')
  }

  getObserver (property) {
    return this.properties[property].observer
  }

  hasArrayObserver (property) {
    return this.properties[property].hasOwnProperty('arrayObserver')
  }

  getArrayObserver (property) {
    return this.properties[property].arrayObserver
  }

  hasItemObserver (property, subProperty) {
    return this.properties[property].hasOwnProperty('itemObserver') &&
      (subProperty
        ? this.properties[property].itemObserver.hasOwnProperty(subProperty)
        : true)
  }

  getItemObserver (property, subProperty) {
    return subProperty
      ? this.properties[property].itemObserver[subProperty]
      : this.properties[property].itemObserver
  }

  createListener (property) {
    const computeValue = this.getComputedFunction(property)
    const dependencies = this.getDependencies(property)

    return function (options) {
      const depValues = []

      for (let dep of dependencies) {
        const depValue = this._get(dep)

        // computed function is only called if all dependencies are set
        if (depValue === undefined) return

        depValues.push(depValue)
      }

      // this references entity instance
      this.__set(property, computeValue(...depValues), options || {})
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
    assertComputedIsFunctionOrString(meta.entityCtor, propName, propMetadata)

    const dependencies = getFunctionArgs(propMetadata.computed)
    for (let dependency of dependencies) {
      assertDependencyExists(meta, propName, dependency)
      meta.properties[dependency].notify = true
    }
    meta.properties[propName].dependencies = dependencies

    d.get = getComputedGetter(propName, dependencies, propMetadata.computed)

    // readOnly by default when computed
    propMetadata.readOnly = true
  }

  if (propMetadata.readOnly) {
    delete d.set
  }

  if (propMetadata.observer) {
    propMetadata.notify = true
  }

  if (propMetadata.arrayObserver) {
    assertTypeIsArray(propName, propMetadata, 'arrayObserver')
    assertArrayObserverHasInsertAndDelete(propName, propMetadata)
    assertArrayObserverFunctionIsInPrototype('insert', meta.entityCtor,
      propName, propMetadata)
    assertArrayObserverFunctionIsInPrototype('delete', meta.entityCtor,
      propName, propMetadata)
  }

  if (propMetadata.itemObserver) {
    assertTypeIsEventEmitterSuccessorOrArray(propName, propMetadata, 'itemObserver')
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

function getComputedGetter (property, dependencies, computeValue) {
  // a computed getter ensures it has been initialized
  return function () {
    const value = this._holder.get(property)

    if (value !== undefined) return value

    // compute value if property has not been initialized yet
    const depValues = []

    for (let dep of dependencies) {
      const depValue = this._get(dep)

      // computed function is only called if all dependencies are set
      if (depValue === undefined) return

      depValues.push(depValue)
    }

    // this references entity instance
    this.__set(property, computeValue(...depValues))

    return this._holder.get(property)
  }
}

function assertComputedIsFunctionOrString (entityCtor, propName, propMetadata) {
  if (typeof propMetadata.computed === 'string') {
    propMetadata.computed = entityCtor.prototype[propMetadata.computed]
  }

  assert(typeof propMetadata.computed === 'function',
    `${propName}'s "computed" must be a function or a string referencing a ` +
    `method in the prototype`)
}

function assertDependencyExists (meta, propName, depName) {
  assert(meta.properties.hasOwnProperty(depName),
    `argument "${depName}" in ${propName}'s computed function could not be ` +
    `resolved. Please make sure the property "${depName}" is declared before ` +
    `"${propName}" in the Entity properties getter.`)
}

function assertTypeIsArray (propName, propMetadata, metaProp) {
  assert(propMetadata.type === Array || propMetadata.type.prototype instanceof EventEmitter,
    `Misplaced ${metaProp} at ${propName}. It must be declared in a property` +
    ` of a type Array.`)
}

function assertTypeIsEventEmitterSuccessorOrArray (propName, propMetadata, metaProp) {
  assert(propMetadata.type === Array || propMetadata.type.prototype instanceof EventEmitter,
    `Misplaced ${metaProp} at ${propName}. It must be declared in a property` +
    ` of a type inheriting from EventEmitter or Array.`)
}

function assertArrayObserverHasInsertAndDelete (propName, propMetadata) {
  assert(propMetadata.arrayObserver.hasOwnProperty('insert') &&
    propMetadata.arrayObserver.hasOwnProperty('delete'),
    `${propName}'s arrayObserver must have 'insert' and 'delete' observers.`)
}

function assertArrayObserverFunctionIsInPrototype (funcRef, entityCtor, propName,
  propMetadata) {
  assert(typeof entityCtor.prototype[propMetadata.arrayObserver[funcRef]] === 'function',
    `${propMetadata.arrayObserver[funcRef]} ${funcRef} function not found` +
    ` in ${entityCtor.name} prototype.`)
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
