const express = require('express')
const expressJwt = require('express-jwt')
const { InvoiceHandler } = require('../handlers')
const invoiceItemRouter = require('./invoice-item-router')

const ID_PARAM = InvoiceHandler.ID_PARAM
const ID_PATH = `/:${ID_PARAM}([0-9]+)`

const router = express.Router()

router.use(InvoiceHandler.retrieveOptions)
router.use(InvoiceHandler.processIncludeOption)
router.param(ID_PARAM, InvoiceHandler.retrieveEntity)

router.use(expressJwt({ secret: process.env.JWT_SECRET }))

router.route('/')
  .get(InvoiceHandler.getAll)
  .post(InvoiceHandler.create)

router.route(ID_PATH)
  .get(InvoiceHandler.getOne)
  .patch(InvoiceHandler.merge)
  .put(InvoiceHandler.update)
  .delete(InvoiceHandler.delete)

router.use(invoiceItemRouter)

module.exports = router
