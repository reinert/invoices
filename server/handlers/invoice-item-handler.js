const ApiError = require('../errors/api-error')
const HttpStatus = require('http-status')
const ResourceHandler = require('./resource-handler')
const { Invoice, InvoiceItem } = require('../../core')
const ResourceMetadata = require('./resource-metadata')

const metadata = new ResourceMetadata(InvoiceItem, {
  parent: {
    metadata: new ResourceMetadata(Invoice),
    alias: 'items',
    eager: true
  }
})

class InvoiceItemHandler extends ResourceHandler(metadata) {
  static checkAuthorization (req, res, next) {
    if (res.locals.invoice.user.id !== req.user.id) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED))
    }

    next()
  }

  static setInvoiceAmountHeader (req, res, next) {
    res.set('invoice-amount', res.locals.invoice.amount)

    next()
  }
}

module.exports = InvoiceItemHandler
