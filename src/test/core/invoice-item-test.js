/* global describe it beforeEach */
const chai = require('chai')
// const chaiAsPromised = require('chai-as-promised')
const { InvoiceItem } = require('../../core')

// chai.use(chaiAsPromised)
const expect = chai.expect

describe('InvoiceItem', () => {
  let item = null

  beforeEach(() => {
    item = new InvoiceItem({ description: 'A', quantity: 4, unitPrice: 2.50 })
  })

  it('shoud notify amountChanged when quantity changes', function (done) {
    this.timeout(100)

    item.on('amountChanged', function (amount, old) {
      expect(this).to.be.equal(item)
      expect(amount).to.be.equal(5)
      expect(old).to.be.equal(10)
      expect(item).to.have.property('amount', amount)
      done()
    })

    item.quantity = 2
  })

  it('shoud notify amountChanged when unitPrice changes', function (done) {
    this.timeout(100)

    item.on('amountChanged', function (amount, old) {
      expect(this).to.be.equal(item)
      expect(amount).to.be.equal(20)
      expect(old).to.be.equal(10)
      expect(item).to.have.property('amount', amount)
      done()
    })

    item.unitPrice = 5
  })
})
