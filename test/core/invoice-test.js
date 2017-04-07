/* global describe beforeEach it */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { Invoice, SimpleInvoice } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('Invoice', () => {
  let simpleInvoice = null

  beforeEach(() => {
    simpleInvoice = new SimpleInvoice(
      { invoiceDate: new Date(), amount: 100.00 })
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
