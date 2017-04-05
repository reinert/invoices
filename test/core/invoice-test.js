// global describe beforeEach it */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { SimpleInvoice, Invoice } = require('../../core')

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
    expect(SimpleInvoice.prototype).to.have.deep.property(
      '_descriptors.type.readOnly', true)
    expect(SimpleInvoice.prototype).to.have.deep.property(
      '_descriptors.type.value', 'SIMPLE')
  })

  it('type is SIMPLE after creation', () => {
    return expect(simpleInvoice).to.have.property('type', 'SIMPLE')
  })
})
