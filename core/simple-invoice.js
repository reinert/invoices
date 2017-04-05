const Invoice = require('./invoice')

class SimpleInvoice extends Invoice {
}

Invoice.$('type', { value: 'SIMPLE' })

module.exports = Invoice
