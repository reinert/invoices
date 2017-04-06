const Invoice = require('./invoice')

class SimpleInvoice extends Invoice {}

SimpleInvoice.$({ 'type': { value: 'SIMPLE' } })

module.exports = SimpleInvoice
