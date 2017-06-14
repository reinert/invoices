const express = require('express')
const { InvoiceItemHandler } = require('../handlers')

const PARENT_ID_PARAM = 'invoiceId'
const ID_PARAM = 'id'

const ROOT_PATH = `/:${PARENT_ID_PARAM}([0-9]+)/items`
const ID_PATH = `/:${ID_PARAM}([0-9]+)`

const router = express.Router()

router.use(InvoiceItemHandler.parseOptions)
router.param(PARENT_ID_PARAM, InvoiceItemHandler.retrieveInvoice)
router.param(ID_PARAM, InvoiceItemHandler.retrieveInvoiceItem)

router.route(ROOT_PATH)
  .all(InvoiceItemHandler.checkAuthorization)
  .get(InvoiceItemHandler.getAll)
  .post(InvoiceItemHandler.create)
  .all(InvoiceItemHandler.setInvoiceAmountHeader, InvoiceItemHandler.sendResult)

router.route(ROOT_PATH + ID_PATH)
  .all(InvoiceItemHandler.checkAuthorization)
  .get(InvoiceItemHandler.getOne)
  .patch(InvoiceItemHandler.merge)
  .put(InvoiceItemHandler.update)
  .delete(InvoiceItemHandler.delete)
  .all(InvoiceItemHandler.setInvoiceAmountHeader, InvoiceItemHandler.sendResult)

module.exports = router
