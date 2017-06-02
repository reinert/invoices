const ResourceHandler = require('./resource-handler')
const { Invoice, InvoiceItem } = require('../../core')

class InvoiceHandler extends ResourceHandler(Invoice) {
  // executed after #retrieveOptions
  static processIncludeOption (req, res, next) {
    if (!req.options || !req.options.include) return next()

    const idx = req.options.include.indexOf('items')
    if (idx !== -1) {
      req.options.include[idx] = { model: InvoiceItem, as: 'items' }
    }

    return next()
  }

  // @override
  static create (req, res, next) {
    if (req.body.type === 'DETAILED') {
      req.options = { include: [ 'items' ] }
    }

    super.create(req, res, next)
  }
}

module.exports = InvoiceHandler
