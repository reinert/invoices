const Entity = require('./entity')

class InvoiceItem extends Entity {
  toString () {
    return `Invoice: {id: ${this.id}, description: ${this.description}, ` +
      `amount: ${this.amount} }`
  }
}

InvoiceItem.$({
  'description': {},
  'quantity': {},
  'unitPrice': {},
  'amount': {
    computed: (quantity, unitPrice) => quantity * unitPrice
  }
})

module.exports = InvoiceItem
