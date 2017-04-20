/* global describe it */
const chai = require('chai')
const Entity = require('../../core/entity')
const AssertionError = require('assert').AssertionError

const expect = chai.expect

describe('Entity Static', () => {
  it('computed must be a function', () => {
    class Test extends Entity {
      static get properties () {
        return {
          'malformedComputed': {
            type: String,
            computed: 'bad'
          }
        }
      }
    }
    expect(() => new Test()).to.throw(AssertionError,
      '"computed" must be a function')
  })

  it('computed properties must be declared after dependent properties', () => {
    class Test extends Entity {
      static get properties () {
        return {
          'a': { type: Number },
          'ab': {
            type: Number,
            computed: (a, b) => a + b
          },
          'b': { type: Number }
        }
      }
    }
    expect(() => new Test()).to.throw(AssertionError,
      'computed function could not be resolved')
  })

  it('computed properties are readOnly', () => {
    class Test extends Entity {
      static get properties () {
        return {
          'a': { type: Number },
          'b': { type: Number },
          'ab': {
            type: Number,
            computed: (a, b) => a + b
          }
        }
      }
    }
    expect(new Test().constructor._descriptors.ab.readOnly).to.be.equal(true)
  })
})

describe('Entity __coerce on construction', () => {
  class Custom extends Entity {
    static get properties () {
      return {
        'name': String,
        'age': Number
      }
    }

    equals (o) {
      return o != null && o.name === this.name && o.age === this.age
    }
  }

  class Test extends Entity {
    static get properties () {
      return {
        'str': String,
        'int': Number,
        'dbl': Number,
        'bool': Boolean,
        'date': Date,
        'arr': Array,
        'custom': Custom,
        'customArr': { type: Array, subType: Custom }
      }
    }
  }

  it('String literal', () => {
    const test = new Test({ str: 'literal' })
    expect(test.str).to.be.equal('literal')
  })

  it('String coercion', () => {
    const test = new Test({ str: 123 })
    expect(test.str).to.be.equal('123')
  })

  it('Number literal', () => {
    const test = new Test({ int: 123, dbl: 1.01 })
    expect(test.int).to.be.equal(123)
    expect(test.dbl).to.be.equal(1.01)
  })

  it('Number coercion', () => {
    const test = new Test({ int: '123', dbl: '1.01' })
    expect(test.int).to.be.equal(123)
    expect(test.dbl).to.be.equal(1.01)
  })

  it('Boolean literal', () => {
    const test = new Test({ bool: true })
    expect(test.bool).to.be.equal(true)
  })

  it('Boolean coercion', () => {
    const test = new Test({ bool: 1 })
    expect(test.bool).to.be.equal(true)
  })

  it('Date type', () => {
    const d = new Date()
    const test = new Test({ date: d })
    expect(test.date.getTime()).to.be.equal(d.getTime())
  })

  it('Date coercion', () => {
    const t = new Date().getTime()
    const test = new Test({ date: t })
    expect(test.date.getTime()).to.be.equal(t)
  })

  it('Array type', () => {
    const arr = [1, 2, 3]
    const test = new Test({ arr: arr })
    expect(test.arr.toString()).to.be.equal(arr.toString())
  })

  it('Array invalid value', () => {
    const arr = '[1, 2, 3]'
    expect(() => new Test({ arr: arr })).to.throw(TypeError,
      'must be an array')
  })

  it('Custom type', () => {
    const c = new Custom({ name: 'any', age: 9 })
    const test = new Test({ custom: c })
    expect(test.custom.equals(c)).to.be.equal(true)
  })

  it('Custom coercion', () => {
    const c = new Custom({ name: 'any', age: 9 })
    const test = new Test({ custom: { name: 'any', age: 9 } })
    expect(test.custom instanceof Custom).to.be.equal(true)
    expect(test.custom.equals(c)).to.be.equal(true)
  })

  it('Custom Array type', () => {
    const arr = [
      new Custom({ name: 'a', age: 1 }),
      new Custom({ name: 'b', age: 2 })
    ]
    const test = new Test({ customArr: arr })
    expect(test.customArr[0].equals(arr[0])).to.be.equal(true)
    expect(test.customArr[1].equals(arr[1])).to.be.equal(true)
  })

  it('Custom Array coercion', () => {
    const arr = [
      new Custom({ name: 'a', age: 1 }),
      new Custom({ name: 'b', age: 2 })
    ]
    const test = new Test({
      customArr: [{ name: 'a', age: 1 }, { name: 'b', age: 2 }]
    })
    expect(test.customArr[0] instanceof Custom).to.be.equal(true)
    expect(test.customArr[0].equals(arr[0])).to.be.equal(true)
    expect(test.customArr[1] instanceof Custom).to.be.equal(true)
    expect(test.customArr[1].equals(arr[1])).to.be.equal(true)
  })
})

describe('Entity __coerce after construction', () => {
  class Custom extends Entity {
    static get properties () {
      return {
        'name': String,
        'age': Number
      }
    }

    equals (o) {
      return o != null && o.name === this.name && o.age === this.age
    }
  }

  class Test extends Entity {
    static get properties () {
      return {
        'str': String,
        'int': Number,
        'dbl': Number,
        'bool': Boolean,
        'date': Date,
        'arr': Array,
        'custom': Custom,
        'customArr': { type: Array, subType: Custom }
      }
    }
  }

  it('String literal', () => {
    const test = new Test()
    test.str = 'literal'

    expect(test.str).to.be.equal('literal')
  })

  it('String coercion', () => {
    const test = new Test()
    test.str = 123

    expect(test.str).to.be.equal('123')
  })

  it('Number literal', () => {
    const test = new Test()
    test.int = 123
    test.dbl = 1.01

    expect(test.int).to.be.equal(123)
    expect(test.dbl).to.be.equal(1.01)
  })

  it('Number coercion', () => {
    const test = new Test()
    test.int = '123'
    test.dbl = '1.01'

    expect(test.int).to.be.equal(123)
    expect(test.dbl).to.be.equal(1.01)
  })

  it('Boolean literal', () => {
    const test = new Test()
    test.bool = true

    expect(test.bool).to.be.equal(true)
  })

  it('Boolean coercion', () => {
    const test = new Test()
    test.bool = 1

    expect(test.bool).to.be.equal(true)
  })

  it('Date type', () => {
    const d = new Date()

    const test = new Test()
    test.date = d

    expect(test.date.getTime()).to.be.equal(d.getTime())
  })

  it('Date coercion', () => {
    const t = new Date().getTime()

    const test = new Test()
    test.date = t

    expect(test.date.getTime()).to.be.equal(t)
  })

  it('Array type', () => {
    const arr = [1, 2, 3]

    const test = new Test()
    test.arr = arr

    expect(test.arr.toString()).to.be.equal(arr.toString())
  })

  it('Array invalid value', () => {
    const arr = '[1, 2, 3]'

    const test = new Test()

    expect(() => { test.arr = arr }).to.throw(TypeError,
      'must be an array')
  })

  it('Custom type', () => {
    const c = new Custom({ name: 'any', age: 9 })

    const test = new Test()
    test.custom = c

    expect(test.custom.equals(c)).to.be.equal(true)
  })

  it('Custom coercion', () => {
    const c = new Custom({ name: 'any', age: 9 })

    const test = new Test()
    test.custom = { name: 'any', age: 9 }

    expect(test.custom instanceof Custom).to.be.equal(true)
    expect(test.custom.equals(c)).to.be.equal(true)
  })

  it('Custom Array type', () => {
    const arr = [
      new Custom({ name: 'a', age: 1 }),
      new Custom({ name: 'b', age: 2 })
    ]

    const test = new Test()
    test.customArr = arr

    expect(test.customArr[0].equals(arr[0])).to.be.equal(true)
    expect(test.customArr[1].equals(arr[1])).to.be.equal(true)
  })

  it('Custom Array coercion', () => {
    const arr = [
      new Custom({ name: 'a', age: 1 }),
      new Custom({ name: 'b', age: 2 })
    ]

    const test = new Test()
    test.customArr = [{ name: 'a', age: 1 }, { name: 'b', age: 2 }]

    expect(test.customArr[0] instanceof Custom).to.be.equal(true)
    expect(test.customArr[0].equals(arr[0])).to.be.equal(true)
    expect(test.customArr[1] instanceof Custom).to.be.equal(true)
    expect(test.customArr[1].equals(arr[1])).to.be.equal(true)
  })
})

describe('Entity Constructor Function',
  testEntityConstructorProps(Entity))

describe('Entity Instance',
  testEntityInstanceProps(Entity))

class Thing extends Entity {
  static get properties () {
    return {
      'normal': { type: String },
      'vl': { type: String, value: 'test' },
      'rly': { type: String, readOnly: true },
      'rlyVl': { type: String, readOnly: true, value: 'test' },
      'pvt': { type: Number, private: true },
      'a': { type: Number },
      'b': { type: Number },
      'ab': {
        type: Number,
        computed: (a, b) => a + b
      },
      'notifies': { type: String, notify: true }
    }
  }
}

describe('Entity Inheritance Constructor Function',
  testEntityConstructorProps(Thing))

describe('Entity Inheritance Instance',
  testEntityInstanceProps(Thing))

describe('Entity Inheritance Descriptors',
  testDescriptors(Thing))

describe('Entity Inheritance Public Methods',
  testPublicMethods(Thing))

describe('Entity Inheritance Protected Methods',
  testProtectedMethods(Thing))

class Parent extends Entity {
  static get properties () {
    return {
      'normal': { type: String },
      'vl': { type: String, value: 'test' },
      'rlyVl': { type: String, readOnly: true, value: 'test' },
      'a': { type: Number },
      'notifies': { type: String, notify: true }
    }
  }
}

class Child extends Parent {
  static get properties () {
    return {
      'rly': { type: String, readOnly: true },
      // 'rlyVl' accumulates both 'value' and 'readOnly'
      // because in parent it's already defined as readOnly
      'rlyVl': { type: String, readOnly: true, value: 'test' },
      'pvt': { type: Number, private: true },
      'b': { type: Number },
      'ab': {
        type: Number,
        computed: (a, b) => a + b
      }
    }
  }
}

describe('Entity Inheritance Constructor Function',
  testEntityConstructorProps(Child))

describe('Entity Inheritance Instance',
  testEntityInstanceProps(Child))

describe('Entity Two Level Inheritance Descriptors',
  testDescriptors(Child))

describe('Entity Two Level Inheritance Public Methods',
  testPublicMethods(Child))

describe('Entity Two Level Inheritance Protected Methods',
  testProtectedMethods(Child))

function testEntityConstructorProps (Clazz) {
  return () => {
    it("has '_descriptors' and '_propertyDescriptors'", () => {
      expect(new Clazz().constructor).to.have.ownProperty('_descriptors')
      expect(Clazz).to.have.ownProperty('_propertyDescriptors')
    })

    it("has '_descriptors' filled with 'id', 'createdAt' and 'updatedAt'", () => {
      expect(new Clazz().constructor).to.have.deep.property('_descriptors.id')
      expect(Clazz).to.have.deep.property('_descriptors.createdAt')
      expect(Clazz).to.have.deep.property('_descriptors.updatedAt')
    })
  }
}

function testEntityInstanceProps (Clazz) {
  return () => {
    it("has 'id', 'createdAt' and 'updatedAt'", () => {
      let instance = new Clazz()
      expect(instance).to.have.ownProperty('id')
      expect(instance).to.have.ownProperty('createdAt')
      expect(instance).to.have.ownProperty('updatedAt')
    })

    it("has '_holder' not enumerable", () => {
      let instance = new Clazz()
      expect(instance).to.have.ownProperty('_holder')
      expect(instance).ownPropertyDescriptor('_holder')
        .to.have.property('enumerable', false)
    })

    it("properties' values should not be mixed in multiple instances", () => {
      let a = new Clazz({ id: 1 })
      let b = new Clazz({ id: 2 })
      expect(a).to.have.property('id', 1)
      expect(b).to.have.property('id', 2)
    })
  }
}

function testDescriptors (Clazz) {
  return function () {
    it('has declared properties', function () {
      let instance = new Clazz()
      expect(instance).to.have.ownProperty('vl')
      expect(instance).to.have.ownProperty('rly')
      expect(instance).to.have.ownProperty('rlyVl')
      expect(instance).to.have.ownProperty('_pvt')
    })

    it('readOnly prop cannot be written', function () {
      let instance = new Clazz()
      instance.rly = 'newRly'
      expect(instance.rly).to.be.equal(undefined)
    })

    it('readOnly prop can be written in construction if not defined yet',
      function () {
        let instance = new Clazz({ rly: 'newRly' })
        expect(instance.rly).to.be.equal('newRly')
      })

    it('readOnly prop cannot be written in construction if already defined',
      function () {
        let instance = new Clazz({ rlyVl: 'newRly' })
        expect(instance.rlyVl).to.be.equal('test')
      }
    )

    it('readOnly prop can be written by using _set(force = true)', function () {
      let instance = new Clazz()
      instance._set('rly', 'newRly', true)
      expect(instance.rly).to.be.equal('newRly')
    })

    it('private property cannot be seen publicly', function () {
      let instance = new Clazz()
      expect(instance).to.have.ownProperty('_pvt')
      expect(instance).to.not.have.ownProperty('pvt')
    })

    it('private property cannot be written in construction',
      function () {
        let instance = new Clazz({ pvt: 123, _pvt: 123 })
        expect(instance._pvt).to.be.equal(undefined)
      }
    )

    it('private property can be written privately', function () {
      let instance = new Clazz()
      instance._pvt = 123
      expect(instance._pvt).to.be.equal(123)
    })

    it('computed properties work properly on Contruction', function () {
      let instance = new Clazz({ a: 1, b: 2 })
      expect(instance.ab).to.be.equal(3)
    })

    it('computed properties work properly after Contruction', function () {
      let instance = new Clazz()
      expect(instance.ab).to.be.equal(undefined)
      instance.a = 1
      expect(Number.isNaN(instance.ab)).to.be.equal(false)
      instance.b = 2
      expect(instance.ab).to.be.equal(3)
    })

    it('notify fires a change event when property is changed', function (done) {
      this.timeout(100)

      let instance = new Clazz({ notifies: 'first' })

      instance.on('notifiesChanged', function (value, oldValue) {
        expect(this).to.be.equal(instance)
        expect(value).to.be.equal('second')
        expect(oldValue).to.be.equal('first')
        done()
      })

      instance.notifies = 'second'
    })
  }
}

function testPublicMethods (Clazz) {
  return () => {
    it('merge overwrites writable properties', () => {
      let instance = new Clazz({ normal: 'a' })

      instance.merge({ normal: 'b', vl: 'other' })

      expect(instance.normal).to.be.equal('b')
      expect(instance.vl).to.be.equal('other')
    })

    it('merge does not affect non-writable properties', () => {
      let instance = new Clazz()

      instance.merge({ pvt: 'newPvt', rly: 'newRly', rlyVl: 'newRlyVl' })

      expect(instance.pvt).to.be.equal(undefined)
      expect(instance.rly).to.be.equal(undefined)
      expect(instance.rlyVl).to.be.equal('test')
    })

    it('merge missing properties does not affect instance', () => {
      let instance = new Clazz({ normal: 'a' })

      instance.merge({})

      expect(instance.normal).to.be.equal('a')
      expect(instance.vl).to.be.equal('test')
    })

    it('update overwrites writable properties', () => {
      let instance = new Clazz({ normal: 'a' })

      instance.update({ normal: 'b', vl: 'other' })

      expect(instance.normal).to.be.equal('b')
      expect(instance.vl).to.be.equal('other')
    })

    it('update does not affect non-writable properties', () => {
      let instance = new Clazz()

      instance.update({ pvt: 'newPvt', rly: 'newRly', rlyVl: 'newRlyVl' })

      expect(instance.pvt).to.be.equal(undefined)
      expect(instance.rly).to.be.equal(undefined)
      expect(instance.rlyVl).to.be.equal('test')
    })

    it('update missing properties are set to null', () => {
      let instance = new Clazz({ normal: 'a' })

      instance.update({})

      expect(instance.normal).to.be.equal(null)
      expect(instance.vl).to.be.equal(null)
    })
  }
}

function testProtectedMethods (Clazz) {
  return () => {
    it('computed is not written using _set', () => {
      let instance = new Clazz()
      instance._set('ab', 123)

      expect(instance.ab).to.be.not.equal(123)
    })

    it('readOnly is not written using _set', () => {
      let instance = new Clazz()
      instance._set('rly', 123)

      expect(instance.rly).to.be.not.equal(123)
    })

    it('readOnly is written using _set(force = true)', () => {
      let instance = new Clazz()
      instance._set('rly', 'newRly', true)

      expect(instance.rly).to.be.equal('newRly')
    })

    it('private property is written using _set', () => {
      let instance = new Clazz()
      instance._set('pvt', 123)

      expect(instance._pvt).to.be.equal(123)
    })

    it('default value is retrieved using _get', () => {
      let instance = new Clazz()

      expect(instance._get('vl')).to.be.equal('test')
    })

    it('private property is retrieved using _get', () => {
      let instance = new Clazz()
      instance._set('pvt', 123)

      expect(instance._get('pvt')).to.be.equal(123)
    })
  }
}
