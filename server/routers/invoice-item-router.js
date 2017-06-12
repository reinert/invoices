const express = require('express')
const { InvoiceItemHandler } = require('../handlers')

const PARENT_ID_PARAM = InvoiceItemHandler.PARENT_ID_PARAM
const ID_PARAM = InvoiceItemHandler.ID_PARAM

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

router.route(ROOT_PATH + ID_PATH)
  .all(InvoiceItemHandler.checkAuthorization)
  .get(InvoiceItemHandler.getOne)
  .patch(InvoiceItemHandler.merge)
  .put(InvoiceItemHandler.update)
  .delete(InvoiceItemHandler.delete)

module.exports = router
