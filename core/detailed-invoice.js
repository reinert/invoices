const Invoice = require('./invoice')

class DetailedInvoice extends Invoice {}

DetailedInvoice.$({
  'type': { value: 'DETAILED' },
  'items': {}
})

module.exports = DetailedInvoice
