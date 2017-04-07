/* global describe it */
const chai = require('chai')
const Entity = require('../../core/entity')

const expect = chai.expect

describe('Entity Constructor Function',
  testEntityConstructorProps(Entity))

describe('Entity Instance',
  testEntityInstanceProps(Entity))

class Thing extends Entity {}
Thing.$({
  'normal': {},
  'vl': { value: 'test' },
  'rly': { readOnly: true },
  'rlyVl': { readOnly: true, value: 'test' },
  'pvt': { private: true }
})

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

class Parent extends Entity {}
Parent.$({
  'normal': {},
  'vl': { value: 'test' },
  'rlyVl': { readOnly: true }
})

class Child extends Parent {}
Child.$({
  'rly': { readOnly: true },
  // 'rlyVl' accumulates both 'value' and 'readOnly'
  // because in parent it's already defined as readOnly
  'rlyVl': { value: 'test' },
  'pvt': { private: true }
})

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
      expect(Clazz).to.have.ownProperty('_descriptors')
      expect(Clazz).to.have.ownProperty('_propertyDescriptors')
    })

    it("has '_descriptors' filled with 'id', 'createdAt' and 'updatedAt'", () => {
      expect(Clazz).to.have.deep.property('_descriptors.id')
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
      let a = new Clazz({id: 1})
      let b = new Clazz({id: 2})
      expect(a).to.have.property('id', 1)
      expect(b).to.have.property('id', 2)
    })
  }
}

function testDescriptors (Clazz) {
  return () => {
    it('has declared properties', () => {
      let instance = new Clazz()
      expect(instance).to.have.ownProperty('vl')
      expect(instance).to.have.ownProperty('rly')
      expect(instance).to.have.ownProperty('rlyVl')
      expect(instance).to.have.ownProperty('_pvt')
    })

    it('readOnly prop cannot be written', () => {
      let instance = new Clazz()
      instance.rly = 123
      expect(instance.rly).to.be.equal(undefined)
    })

    it('readOnly prop can be written in construction if not defined yet', () => {
      let instance = new Clazz({ rly: 123 })
      expect(instance.rly).to.be.equal(123)
    })

    it('readOnly prop cannot be written in construction if already defined',
      () => {
        let instance = new Clazz({ rlyVl: 123 })
        expect(instance.rlyVl).to.be.equal('test')
      })

    it('readOnly prop can be written by using _set(force = true)', () => {
      let instance = new Clazz()
      instance._set('rly', 123, true)
      expect(instance.rly).to.be.equal(123)
    })

    it('private property cannot be seen publicly', () => {
      let instance = new Clazz()
      expect(instance).to.have.ownProperty('_pvt')
      expect(instance).to.not.have.ownProperty('pvt')
    })

    it('private prop cannot be written in construction',
      () => {
        let instance = new Clazz({ pvt: 123, _pvt: 123 })
        expect(instance._pvt).to.be.equal(undefined)
      })

    it('private property can be written privately', () => {
      let instance = new Clazz()
      instance._pvt = 123
      expect(instance._pvt).to.be.equal(123)
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
    it('readOnly is not written using _set', () => {
      let instance = new Clazz()
      instance._set('rly', 123)

      expect(instance.rly).to.be.not.equal(123)
    })

    it('readOnly is written using _set(force = true)', () => {
      let instance = new Clazz()
      instance._set('rly', 123, true)

      expect(instance.rly).to.be.equal(123)
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
