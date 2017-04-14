const Entity = require('./entity')

class Invoice extends Entity {
  static get properties () {
    return {
      'type': {
        type: String,
        readOnly: true
      },
      'description': {
        type: String
      },
      'invoiceDate': {
        type: Date
      },
      'invoiceNumber': {
        type: Number
      },
      'amount': {
        type: Number
      },
      'providerName': {
        type: String
      },
      'providerRegistrationNumber': {
        type: String
      }
    }
  }

  toString () {
    return `Invoice: {id: ${this.id}, type: ${this.type}, ` +
      `invoiceDate: ${this.invoiceDate}, amount: ${this.amount} }`
  }
}

module.exports = Invoice
