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

class Parent extends Entity {}
Parent.$({
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

    it('properties\' values should not be mixed in multiple instances', () => {
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

    it('readOnly prop cannot be written in construction',
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
