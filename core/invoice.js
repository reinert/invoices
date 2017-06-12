const PersistentEntity = require('./persistent-entity')
const { User } = require('./user')
const { InvalidArgumentException } = require('./errors')

const InvoiceType = { SIMPLE: 'SIMPLE', DETAILED: 'DETAILED' }

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
      'beneficiaryName': {
        type: String
      },
      'beneficiaryRegistrationNumber': {
        type: String
      }
    }
  }

  // Factory method supported by Entity to build entities on an abstract level
  static create (values, options) {
    if (values == null) {
      return null
    }
    if (values.type === InvoiceType.SIMPLE) {
      return new SimpleInvoice(values, options)
    }
    if (values.type === InvoiceType.DETAILED) {
      return new DetailedInvoice(values, options)
    }
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
      'type': {
        value: InvoiceType.SIMPLE
      },
      'amount': {
        value: 0.00
      }
    }
  }
}

class DetailedInvoice extends Invoice {
  static get properties () {
    return {
      'type': {
        value: InvoiceType.DETAILED
      },
      'amount': {
        value: 0.00,
        readOnly: true
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
    // #_set with force=true to bypass readOnly restriction
    this._set('amount', this.amount + item.amount, true)
  }

  _onItemDelete (item) {
    // #_set with force=true to bypass readOnly restriction
    this._set('amount', this.amount - item.amount, true)
  }

  _onItemAmountChange (amount, old) {
    // TODO: extensively test this check to see if it's really necessary
    if (old === undefined) old = 0
    this._set('amount', this.amount + amount - old, true)
  }
}

class InvoiceItem extends PersistentEntity {
  static get properties () {
    return {
      'invoiceId': {
        type: Number,
        required: true,
        readOnly: true
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
        computed: '_computeAmount', // optionally, put inline function
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

module.exports = {
  Invoice,
  InvoiceType,
  SimpleInvoice,
  DetailedInvoice,
  InvoiceItem
}
