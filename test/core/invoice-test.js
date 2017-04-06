/* global describe beforeEach it */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { Invoice, SimpleInvoice, User } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('Invoice', () => {
  let simpleInvoice = null

  beforeEach(() => {
    simpleInvoice = new SimpleInvoice(
      { invoiceDate: new Date(), amount: 100.00 })
  })

  it('properties\' values should not be mixed in multiple instances', () => {
    let john = new User({username: 'john'})
    let bob = new User({username: 'bob'})
    expect(john).to.have.property('username', 'john')
    expect(bob).to.have.property('username', 'bob')
  })

  it('type descriptor has \'value\' and \'readOnly\' props after creation',
    () => {
      expect(Invoice).to.have.deep.property(
        '_descriptors.type.readOnly', true)
      expect(Invoice).to.not.have.deep.property(
        '_descriptors.type.value')
      expect(SimpleInvoice).to.have.deep.property(
        '_descriptors.type.readOnly', true)
      expect(SimpleInvoice).to.have.deep.property(
        '_descriptors.type.value', 'SIMPLE')
    })

  it('type is \'SIMPLE\' after creation', () => {
    return expect(simpleInvoice).to.have.property('type', 'SIMPLE')
  })
})
