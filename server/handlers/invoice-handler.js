const ApiError = require('../errors/api-error')
const HttpStatus = require('http-status')
const { Invoice, InvoiceItem } = require('../../core')
const ResourceHandler = require('./resource-handler')
const ResourceMetadata = require('./resource-metadata')

class InvoiceHandler extends ResourceHandler(new ResourceMetadata(Invoice)) {
  static checkAuthorization (req, res, next) {
    if (res.locals.invoice.user.id !== req.user.id) {
      return next(new ApiError(HttpStatus.UNAUTHORIZED))
    }

    return next()
  }

  // executed after #retrieveOptions
  static processIncludeOption (req, res, next) {
    if (!req.options.include) return next()

    // if it was requested to fetch items, then specify in the include option
    // the InvoiceItem model so db (sequelize) can join correctly
    const idx = req.options.include.indexOf('items')
    if (idx !== -1) {
      req.options.include[idx] = { model: InvoiceItem, as: 'items' }
    }

    return next()
  }

  // @override
  static getAll (req, res, next) {
    req.options.where = { userId: req.user.id }

    super.getAll(req, res, next)
  }

  // @override
  static create (req, res, next) {
    req.body.user = req.user
    if (req.body.type === 'DETAILED') {
      req.options.include = [ 'items' ]
    }

    super.create(req, res, next)
  }
}

module.exports = InvoiceHandler
