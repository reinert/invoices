const express = require('express')
const expressJwt = require('express-jwt')
const { InvoiceItemHandler } = require('../handlers')

const PARENT_ID_PARAM = InvoiceItemHandler.PARENT_ID_PARAM
const ID_PARAM = InvoiceItemHandler.ID_PARAM

const ROOT_PATH = `/:${PARENT_ID_PARAM}([0-9]+)/items`
const ID_PATH = `/:${ID_PARAM}([0-9]+)`

const router = express.Router()

router.use(InvoiceItemHandler.retrieveOptions)
router.param(PARENT_ID_PARAM, InvoiceItemHandler.retrieveParentId)
router.param(ID_PARAM, InvoiceItemHandler.retrieveEntity)

router.use(expressJwt({ secret: process.env.JWT_SECRET }))

router.route(ROOT_PATH)
  .get(InvoiceItemHandler.getAll)
  .post(InvoiceItemHandler.create)

router.route(ROOT_PATH + ID_PATH)
  .get(InvoiceItemHandler.getOne)
  .patch(InvoiceItemHandler.merge)
  .put(InvoiceItemHandler.update)
  .delete(InvoiceItemHandler.delete)

module.exports = router
