/* global describe it */
const chai = require('chai')
const PersistentEntity = require('../../core/persistent-entity')
// const AssertionError = require('assert').AssertionError

const expect = chai.expect

describe('PersistentEntity Instance', () => {
  it("has readOnly property named 'id'", () => {
    let instance = new PersistentEntity({ id: 1 })
    instance.id = 2

    expect(instance).to.have.ownProperty('id', 1)
    expect(instance.constructor).to.have.deep.property(
      'metadata.properties.id.readOnly', true)
  })

  it("has readOnly property named 'createdAt'", () => {
    let date = new Date(1494596170612)
    let instance = new PersistentEntity({ createdAt: date })
    instance.createdAt = new Date()

    expect(instance).to.have.ownProperty('createdAt', date)
    expect(instance.constructor).to.have.deep.property(
      'metadata.properties.createdAt.readOnly', true)
  })

  it("has readOnly property named 'updatedAt'", () => {
    let date = new Date(1494596170612)
    let instance = new PersistentEntity({ updatedAt: date })
    instance.updatedAt = new Date()

    expect(instance).to.have.ownProperty('updatedAt', date)
    expect(instance.constructor).to.have.deep.property(
      'metadata.properties.updatedAt.readOnly', true)
  })
})
