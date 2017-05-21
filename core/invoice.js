const PersistentEntity = require('./persistent-entity')
const User = require('./user')

class Invoice extends PersistentEntity {
  static get properties () {
    return {
      'user': {
        type: User
      },
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
        type: String
      },
      'amount': {
        type: Number,
        value: 0.00
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
