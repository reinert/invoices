const ApiError = require('../errors/api-error')
const HttpStatus = require('http-status')
const { Repository } = require('../../db')
const SubResourceHandler = require('./sub-resource-handler')
const { Invoice, InvoiceItem } = require('../../core')

class InvoiceItemHandler
    extends SubResourceHandler(InvoiceItem, 'id', 'invoiceId') {
  static checkAuthorization (req, res, next) {
    if (req.invoice.user.id !== req.user.id) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED))
    }

    next()
  }

  static retrieveInvoice (req, res, next) {
    Repository.find(Invoice, { pk: { id: req.options.pk.invoiceId } })
      .then(invoice => {
        if (invoice) {
          req.invoice = invoice
          next()
        } else {
          res.sendStatus(HttpStatus.NOT_FOUND)
        }
        return null
      })
      .catch(next)
  }
}

module.exports = InvoiceItemHandler
