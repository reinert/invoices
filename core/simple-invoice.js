const Invoice = require('./invoice')

class SimpleInvoice extends Invoice {
  static get properties () {
    return {
      'type': { value: 'SIMPLE' }
    }
  }
}

module.exports = SimpleInvoice
