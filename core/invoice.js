const Entity = require('./entity')

class Invoice extends Entity {
  toString () {
    return `Invoice: {id: ${this.id}, type: ${this.type}, ` +
      `invoiceDate: ${this.invoiceDate}, amount: ${this.amount } }`
  }
}

Invoice.$('type', { readOnly: true })
Invoice.$('description')
Invoice.$('invoiceDate')
Invoice.$('invoiceNumber')
Invoice.$('amount')
Invoice.$('providerName')
Invoice.$('providerRegistrationNumber')

module.exports = Invoice
