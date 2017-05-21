/* global describe it beforeEach */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { DetailedInvoice, InvoiceItem } = require('../../core')
const Holder = require('../../core/entity/holder')

// chai.use(chaiAsPromised)
const expect = chai.expect

const createTests = (beforeEachFunc) => function () {
  this.invoice = null
  this.preViousamount = null

  beforeEach(beforeEachFunc)

  it("'s type metadata has 'value' and 'readOnly' props after creation", function () {
    expect(this.invoice.constructor).to.have.deep.property(
      'metadata.properties.type.readOnly', true)
    expect(this.invoice.constructor).to.have.deep.property(
      'metadata.properties.type.value', 'DETAILED')
  })

  it('items array is properly set after creation', function () {
    expect(this.invoice).to.have.property('items')
    expect(this.invoice).to.have.deep.property('items.length', 3)
  })

  it("'s amount is the sum of the items' amounts", function () {
    expect(this.invoice).to.have.property('amount', this.preViousamount)
  })

  it('updates amount when a new item is added', function () {
    this.invoice.items.push({ description: 'D', quantity: 2, unitPrice: 1.10 })
    expect(this.invoice).to.have.property('amount', this.preViousamount + 2.20)
    this.preViousamount = this.invoice.amount

    this.invoice.items.unshift({ description: 'E', quantity: 1, unitPrice: 0.80 })
    expect(this.invoice).to.have.property('amount', this.preViousamount + 0.80)
    this.preViousamount = this.invoice.amount

    this.invoice.items.splice(2, 0,
      { description: 'F', quantity: 1, unitPrice: 2.00 },
      { description: 'G', quantity: 2, unitPrice: 2.50 }
    )
    expect(this.invoice).to.have.property('amount', this.preViousamount + 2 + 5)
  })

  it('updates amount when an item is removed', function () {
    let rm = null

    rm = this.invoice.items.splice(1, 1)[0]
    expect(this.invoice).to.have.property('amount', this.preViousamount - rm.amount)
    this.preViousamount = this.invoice.amount

    rm = this.invoice.items.pop()
    expect(this.invoice).to.have.property('amount', this.preViousamount - rm.amount)
    this.preViousamount = this.invoice.amount

    rm = this.invoice.items.shift()
    expect(this.invoice).to.have.property('amount', this.preViousamount - rm.amount)
  })

  it("updates amount when an item has it's amount changed", function () {
    this.invoice.items[0].quantity = 2
    expect(this.invoice).to.have.property('amount', this.preViousamount + 1)
    this.preViousamount = this.invoice.amount

    this.invoice.items[1].unitPrice = 3.00
    expect(this.invoice).to.have.property('amount', this.preViousamount + 2)
    this.preViousamount = this.invoice.amount

    this.invoice.items.push({ description: 'D', quantity: 1, unitPrice: 2.00 })
    expect(this.invoice).to.have.property('amount', this.preViousamount + 2.00)
    this.preViousamount = this.invoice.amount
    this.invoice.items[3].quantity = 2
    expect(this.invoice).to.have.property('amount', this.preViousamount + 2.00)
    this.preViousamount = this.invoice.amount

    this.invoice.items.push(
      new InvoiceItem({ description: 'E', quantity: 1, unitPrice: 3.00 }))
    expect(this.invoice).to.have.property('amount', this.preViousamount + 3.00)
    this.preViousamount = this.invoice.amount
    this.invoice.items[4].unitPrice = 5.00
    expect(this.invoice).to.have.property('amount', this.preViousamount + 2.00)
  })
}

describe('DetailedInvoice', createTests(function () {
  this.invoice = new DetailedInvoice({
    id: 1,
    invoiceDate: new Date(),
    items: [
      { description: 'A', quantity: 1, unitPrice: 1.00 },
      new InvoiceItem({ description: 'B', quantity: 2, unitPrice: 2.00 }),
      new InvoiceItem(new Holder({ description: 'C', quantity: 4, unitPrice: 2.50 }))
    ]
  })

  this.preViousamount = 15.00
}))

describe('DetailedInvoice with Holder', createTests(function () {
  this.invoice = new DetailedInvoice(new Holder({
    id: 1,
    amount: 15.00,
    invoiceDate: new Date(),
    items: [
      { description: 'A', quantity: 1, unitPrice: 1.00 },
      new InvoiceItem({ description: 'B', quantity: 2, unitPrice: 2.00, amount: 4 }),
      new InvoiceItem(new Holder({ description: 'C', quantity: 4, unitPrice: 2.50, amount: 10 }))
    ]
  }))

  this.preViousamount = 15.00
}))
