const ApiError = require('../errors/api-error')
const HttpStatus = require('http-status')
const SubResourceHandler = require('./sub-resource-handler')
const { Invoice, InvoiceItem } = require('../../core')

const opt = {
  relationProperty: 'items'
}

class InvoiceItemHandler
    extends SubResourceHandler(InvoiceItem, Invoice, opt) {
  static checkAuthorization (req, res, next) {
    if (res.locals.invoice.user.id !== req.user.id) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED))
    }

    next()
  }

  // @override
  static setInvoiceAmountHeader (req, res, next) {
    res.set('invoice-amount', res.locals.invoice.amount)

    next()
  }
}

module.exports = InvoiceItemHandler
