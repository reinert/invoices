/* global describe it */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { DetailedInvoice } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('DetailedInvoice', () => {
  it('type metadata has \'value\' and \'readOnly\' props after creation',
    () => {
      const di = new DetailedInvoice({ invoiceDate: new Date() })
      expect(di.constructor).to.have.deep.property(
        'metadata.properties.type.readOnly', true)
      expect(di.constructor).to.have.deep.property(
        'metadata.properties.type.value', 'DETAILED')
    })

  it("Is necessary so the test below doesn't fail", () => {
    expect(() => new DetailedInvoice({
      invoiceDate: new Date(),
      items: [
        { description: 'A', quantity: 1, unitPrice: 1.00 },
        { description: 'B', quantity: 4, unitPrice: 2.50 }
      ]
    })).not.to.throw()
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

    di.removeItem(1)

    expect(di).to.have.property('amount', 1.00)

    di.removeItem(di.getItem(0))

    expect(di).to.have.property('amount', 0.00)
  })
})
