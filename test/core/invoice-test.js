/* global describe it */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { SimpleInvoice } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('Invoice', () => {
  it('type descriptor has \'value\' and \'readOnly\' props after creation',
    () => {
      const si = new SimpleInvoice({ invoiceDate: new Date(), amount: 100.00 })
      expect(si.constructor).to.have.deep.property(
        '_descriptors.type.readOnly', true)
      expect(si.constructor).to.have.deep.property(
        '_descriptors.type.value', 'SIMPLE')
    })

  it('type is \'SIMPLE\' after creation', () => {
    const si = new SimpleInvoice({ invoiceDate: new Date(), amount: 100.00 })
    return expect(si).to.have.property('type', 'SIMPLE')
  })
})
