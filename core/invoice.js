const PersistentEntity = require('./persistent-entity')
const User = require('./user')
const InvoiceItem = require('./invoice-item')
const { InvalidArgumentException } = require('./errors')

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

  static create (values) {
    if (values == null) return null
    if (values.type === 'SIMPLE') return new SimpleInvoice(values)
    if (values.type === 'DETAILED') return new DetailedInvoice(values)
    throw new InvalidArgumentException('Invoice must have type = ' +
      '{SIMPLE | DETAILED}, otherwise is invalid.', values)
  }

  toString () {
    return `Invoice: {id: ${this.id}, type: ${this.type}, ` +
      `invoiceDate: ${this.invoiceDate}, amount: ${this.amount} }`
  }
}

class SimpleInvoice extends Invoice {
  static get properties () {
    return {
      'type': { value: 'SIMPLE' }
    }
  }
}

class DetailedInvoice extends Invoice {
  static get properties () {
    return {
      'type': {
        value: 'DETAILED'
      },
      'items': {
        type: Array.of(InvoiceItem),
        itemObserver: {
          amount: '_onItemAmountChange'
        },
        arrayObserver: {
          insert: '_onItemInsert',
          delete: '_onItemDelete'
        }
      }
    }
  }

  _onItemInsert (item) {
    this.amount += item.amount
  }

  _onItemDelete (item) {
    this.amount -= item.amount
  }

  _onItemAmountChange (amount, old) {
    if (old === undefined) old = 0
    this.amount = this.amount + amount - old
  }
}

module.exports = { Invoice, SimpleInvoice, DetailedInvoice }
