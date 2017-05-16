const PersistentEntity = require('./persistent-entity')

class InvoiceItem extends PersistentEntity {
  static get properties () {
    return {
      'description': {
        type: String
      },
      'quantity': {
        type: Number
      },
      'unitPrice': {
        type: Number
      },
      'amount': {
        type: Number,
        computed: (quantity, unitPrice) => quantity * unitPrice,
        notify: true
      }
    }
  }

  toString () {
    return `InvoiceItem: { id: ${this.id}, description: ${this.description}, ` +
      `amount: ${this.amount} }`
  }
}

module.exports = InvoiceItem
