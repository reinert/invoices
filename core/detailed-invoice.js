const Invoice = require('./invoice')
const InvoiceItem = require('./invoice-item')

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

module.exports = DetailedInvoice
