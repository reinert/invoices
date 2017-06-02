const express = require('express')
const expressJwt = require('express-jwt')
const { InvoiceHandler } = require('../handlers')

const ID_PARAM = 'id'
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

module.exports = router
