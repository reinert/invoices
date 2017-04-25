const Invoice = require('./invoice')
const InvoiceItem = require('./invoice-item')

class DetailedInvoice extends Invoice {
  static get properties () {
    return {
      'type': {
        value: 'DETAILED'
      },
      'items': {
        type: Array,
        subType: InvoiceItem,
        private: true
      }
    }
  }

  constructor (values) {
    super(values)
    if (values.items) {
      this._items = values.items
      // TODO: register an observer to auto-update this field
      for (let item of this._items) {
        this.amount += item.amount
      }
    }
  }

  addItem (item) {
    // TODO: auto-coerce by proxying the array
    item = this._coerce(item, InvoiceItem)
    this._items.push(item)
    // TODO: register an observer to auto-update this field
    this.amount += item.amount
  }

  removeItem (idx) {
    if (idx instanceof InvoiceItem) {
      idx = this._items.indexOf(idx)
    }
    let removed = this._items.splice(idx, 1)
    // TODO: register an observer to auto-update this field
    if (removed.length > 0) this.amount -= removed[0].amount
  }

  getItemsSize () {
    return this._items.length
  }

  getItem (idx) {
    return this._items[idx]
  }
}

module.exports = DetailedInvoice
