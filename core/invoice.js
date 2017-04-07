const Entity = require('./entity')

class Invoice extends Entity {
  toString () {
    return `Invoice: {id: ${this.id}, type: ${this.type}, ` +
      `invoiceDate: ${this.invoiceDate}, amount: ${this.amount} }`
  }
}

Invoice.$({
  'type': { readOnly: true },
  'description': {},
  'invoiceDate': {},
  'invoiceNumber': {},
  'amount': {},
  'providerName': {},
  'providerRegistrationNumber': {}
})

module.exports = Invoice
