/* global describe it beforeEach */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { DetailedInvoice, InvoiceItem } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('DetailedInvoice', () => {
  let invoice = null
  let previousAmount = null

  beforeEach(() => {
    invoice = new DetailedInvoice({
      id: 1,
      invoiceDate: new Date(),
      items: [
        { description: 'A', quantity: 1, unitPrice: 1.00 },
        { description: 'B', quantity: 2, unitPrice: 2.00 },
        { description: 'C', quantity: 4, unitPrice: 2.50 }
      ]
    })

    previousAmount = 15.00
  })

  it("'s type metadata has 'value' and 'readOnly' props after creation", () => {
    expect(invoice.constructor).to.have.deep.property(
      'metadata.properties.type.readOnly', true)
    expect(invoice.constructor).to.have.deep.property(
      'metadata.properties.type.value', 'DETAILED')
  })

  it('items array is properly set after creation', () => {
    expect(invoice).to.have.property('items')
    expect(invoice).to.have.deep.property('items.length', 3)
  })

  it("'s amount is the sum of the items' amounts", () => {
    expect(invoice).to.have.property('amount', previousAmount)
  })

  it('updates amount when a new item is added', () => {
    invoice.items.push({ description: 'D', quantity: 2, unitPrice: 1.10 })
    expect(invoice).to.have.property('amount', previousAmount + 2.20)
    previousAmount = invoice.amount

    invoice.items.unshift({ description: 'E', quantity: 1, unitPrice: 0.80 })
    expect(invoice).to.have.property('amount', previousAmount + 0.80)
    previousAmount = invoice.amount

    invoice.items.splice(2, 0,
      { description: 'F', quantity: 1, unitPrice: 2.00 },
      { description: 'G', quantity: 2, unitPrice: 2.50 }
    )
    expect(invoice).to.have.property('amount', previousAmount + 2 + 5)
  })

  it('updates amount when an item is removed', () => {
    let rm = null

    rm = invoice.items.splice(1, 1)[0]
    expect(invoice).to.have.property('amount', previousAmount - rm.amount)
    previousAmount = invoice.amount

    rm = invoice.items.pop()
    expect(invoice).to.have.property('amount', previousAmount - rm.amount)
    previousAmount = invoice.amount

    rm = invoice.items.shift()
    expect(invoice).to.have.property('amount', previousAmount - rm.amount)
  })

  it("updates amount when an item has it's amount changed", () => {
    invoice.items[0].quantity = 2
    expect(invoice).to.have.property('amount', previousAmount + 1)
    previousAmount = invoice.amount

    invoice.items[1].unitPrice = 3.00
    expect(invoice).to.have.property('amount', previousAmount + 2)
    previousAmount = invoice.amount

    invoice.items.push({ description: 'D', quantity: 1, unitPrice: 2.00 })
    expect(invoice).to.have.property('amount', previousAmount + 2.00)
    previousAmount = invoice.amount
    invoice.items[3].quantity = 2
    expect(invoice).to.have.property('amount', previousAmount + 2.00)
    previousAmount = invoice.amount

    invoice.items.push(
      new InvoiceItem({ description: 'E', quantity: 1, unitPrice: 3.00 }))
    expect(invoice).to.have.property('amount', previousAmount + 3.00)
    previousAmount = invoice.amount
    invoice.items[4].unitPrice = 5.00
    expect(invoice).to.have.property('amount', previousAmount + 2.00)
  })
})
