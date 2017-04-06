/* global describe it */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const Entity = require('../../core/entity')

chai.use(dirtyChai)

const expect = chai.expect

describe('Entity Constructor Function', () => {
  it("has '_descriptors' and '_propertyDescriptors'", () => {
    expect(Entity).to.have.ownProperty('_descriptors')
    expect(Entity).to.have.ownProperty('_propertyDescriptors')
  })

  it("has '_descriptors' filled with 'id', 'createdAt' and 'updatedAt'", () => {
    expect(Entity).to.have.deep.property('_descriptors.id')
    expect(Entity).to.have.deep.property('_descriptors.createdAt')
    expect(Entity).to.have.deep.property('_descriptors.updatedAt')
  })
})

describe('Entity Instance', () => {
  it("has 'id', 'createdAt' and 'updatedAt'", () => {
    let e = new Entity()
    expect(e).to.have.ownProperty('id')
    expect(e).to.have.ownProperty('createdAt')
    expect(e).to.have.ownProperty('updatedAt')
  })

  it("has '_holder' not enumerable", () => {
    let e = new Entity()
    expect(e).to.have.ownProperty('_holder')
    expect(e).ownPropertyDescriptor('_holder')
      .to.have.property('enumerable', false)
  })

  it('properties\' values should not be mixed in multiple instances', () => {
    let a = new Entity({id: 1})
    let b = new Entity({id: 2})
    expect(a).to.have.property('id', 1)
    expect(b).to.have.property('id', 2)
  })
})

describe('Entity Inheritance Constructor Function', () => {
  class Thing extends Entity {}
  Thing.$()

  it("has '_descriptors' and '_propertyDescriptors'", () => {
    expect(Thing).to.have.ownProperty('_descriptors')
    expect(Thing).to.have.ownProperty('_propertyDescriptors')
  })

  it("has '_descriptors' filled with 'id', 'createdAt' and 'updatedAt'", () => {
    expect(Thing).to.have.deep.property('_descriptors.id')
    expect(Thing).to.have.deep.property('_descriptors.createdAt')
    expect(Thing).to.have.deep.property('_descriptors.updatedAt')
  })
})

describe('Entity Inheritance Instance', () => {
  class Thing extends Entity {}
  Thing.$()

  it("has 'id', 'createdAt' and 'updatedAt'", () => {
    let t = new Thing()
    expect(t).to.have.ownProperty('id')
    expect(t).to.have.ownProperty('createdAt')
    expect(t).to.have.ownProperty('updatedAt')
  })

  it("has '_holder' not enumerable", () => {
    let t = new Thing()
    expect(t).to.have.ownProperty('_holder')
    expect(t).ownPropertyDescriptor('_holder')
      .to.have.property('enumerable', false)
  })
})

describe('Entity Initializer', () => {
  class Thing extends Entity {}
  Thing.$({
    'vl': { value: 'test' },
    'rly': { readOnly: true },
    'rlyVl': { readOnly: true, value: 'test' },
    'pvt': { private: true }
  })

  it('has declared properties', () => {
    let t = new Thing()
    expect(t).to.have.ownProperty('vl')
    expect(t).to.have.ownProperty('rly')
    expect(t).to.have.ownProperty('_pvt')
  })

  it('readOnly prop cannot be written', () => {
    let t = new Thing()
    t.rly = 123
    expect(t.rly).to.be.undefined()
  })

  it('readOnly prop can be written in construction if not defined yet', () => {
    let t = new Thing({ rly: 123 })
    expect(t.rly).to.be.equal(123)
  })

  it('readOnly prop cannot be written in construction if already defined',
    () => {
      let t = new Thing({ rlyVl: 123 })
      expect(t.rlyVl).to.be.equal('test')
    })

  it('readOnly prop can be written by using _set(force = true)', () => {
    let t = new Thing()
    t._set('rly', 123, true)
    expect(t.rly).to.be.equal(123)
  })

  it('private property cannot be seen publicly', () => {
    let t = new Thing()
    expect(t).to.have.ownProperty('_pvt')
    expect(t).to.not.have.ownProperty('pvt')
  })

  it('readOnly prop cannot be written in construction',
    () => {
      let t = new Thing({ pvt: 123, _pvt: 123 })
      expect(t._pvt).to.be.undefined()
    })

  it('private property can be written privately', () => {
    let t = new Thing()
    t._pvt = 123
    expect(t._pvt).to.be.equal(123)
  })
})

describe('Two Level Entity Inheritance', () => {
  // TODO: implement class B extends A extends Entity
})
