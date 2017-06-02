const PersistentEntity = require('./persistent-entity')
const User = require('./user')
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
      'type': { value: 'SIMPLE' },
      'amount': { value: 0.00 }
    }
  }
}

class DetailedInvoice extends Invoice {
  static get properties () {
    return {
      'type': {
        value: 'DETAILED'
      },
      'amount': {
        value: 0.00
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

class InvoiceItem extends PersistentEntity {
  static get properties () {
    return {
      'invoiceId': {
        type: Number,
        required: true
      },
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
        computed: '_computeAmount',
        notify: true
      }
    }
  }

  _computeAmount (quantity, unitPrice) {
    return quantity * unitPrice
  }

  toString () {
    return `InvoiceItem: { invoiceId: ${this.invoiceId}, id: ${this.id}, ` +
      `description: ${this.description}, amount: ${this.amount} }`
  }
}

module.exports = { Invoice, SimpleInvoice, DetailedInvoice, InvoiceItem }
