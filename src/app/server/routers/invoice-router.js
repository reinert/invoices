const express = require('express')
const { InvoiceHandler } = require('../handlers')
const invoiceItemRouter = require('./invoice-item-router')

const ID_PARAM = 'id'
const ID_PATH = `/:${ID_PARAM}([0-9]+)`

const router = express.Router()

router.use(invoiceItemRouter)

router.use(InvoiceHandler.parseOptions)
router.use(InvoiceHandler.processIncludeOption)
router.param(ID_PARAM, InvoiceHandler.retrieveInvoice)

router.route('/')
  .get(InvoiceHandler.getAll)
  .post(InvoiceHandler.create)
  .all(InvoiceHandler.sendResult)

router.route(ID_PATH)
  .all(InvoiceHandler.checkAuthorization)
  .get(InvoiceHandler.getOne)
  .patch(InvoiceHandler.merge)
  .put(InvoiceHandler.update)
  .delete(InvoiceHandler.delete)
  .all(InvoiceHandler.sendResult)

module.exports = router
