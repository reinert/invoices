/* global describe it */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { DetailedInvoice } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('DetailedInvoice', () => {
  it('type descriptor has \'value\' and \'readOnly\' props after creation',
    () => {
      const di = new DetailedInvoice({ invoiceDate: new Date() })
      expect(di.constructor).to.have.deep.property(
        '_descriptors.type.readOnly', true)
      expect(di.constructor).to.have.deep.property(
        '_descriptors.type.value', 'DETAILED')
    })

  it('items array is properly set after creation', () => {
    const di = new DetailedInvoice({
      invoiceDate: new Date(),
      items: [
        { description: 'A', quantity: 1, unitPrice: 1.00 },
        { description: 'B', quantity: 4, unitPrice: 2.50 }
      ]
    })

    expect(di).to.have.property('_items')
    expect(di).to.have.deep.property('_items.length', 2)
    expect(di).to.have.property('amount', 11.00)
  })

  it('updates amount when a new item is added', () => {
    const di = new DetailedInvoice({
      invoiceDate: new Date(),
      items: [
        { description: 'A', quantity: 1, unitPrice: 1.00 },
        { description: 'B', quantity: 4, unitPrice: 2.50 }
      ]
    })

    di.addItem({ description: 'C', quantity: 2, unitPrice: 3.10 })

    expect(di).to.have.property('amount', 17.20)
  })

  it('updates amount when an item is removed', () => {
    const di = new DetailedInvoice({
      invoiceDate: new Date(),
      items: [
        { description: 'A', quantity: 1, unitPrice: 1.00 },
        { description: 'B', quantity: 4, unitPrice: 2.50 }
      ]
    })

    di.removeItem(0)

    expect(di).to.have.property('amount', 10.00)
  })
})