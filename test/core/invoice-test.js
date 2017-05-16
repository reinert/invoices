/* global describe it */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { SimpleInvoice } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('Invoice', () => {
  it('type metadata has \'value\' and \'readOnly\' props after creation',
    () => {
      const di = new SimpleInvoice({ invoiceDate: new Date() })
      expect(di.constructor).to.have.deep.property(
        'metadata.properties.type.readOnly', true)
      expect(di.constructor).to.have.deep.property(
        'metadata.properties.type.value', 'SIMPLE')
    })

  it('type is \'SIMPLE\' after creation', () => {
    const si = new SimpleInvoice({ invoiceDate: new Date(), amount: 100.00 })
    return expect(si).to.have.property('type', 'SIMPLE')
  })
})
