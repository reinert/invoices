const SubResourceHandler = require('./sub-resource-handler')
const { InvoiceItem } = require('../../core')

class InvoiceItemHandler
  extends SubResourceHandler(InvoiceItem, 'id', 'invoiceId') {}

module.exports = InvoiceItemHandler
