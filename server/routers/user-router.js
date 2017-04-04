const express = require('express')
const { UserHandler } = require('../handlers')

const ID_PARAM = 'id'
const ID_PATH = `/:${ID_PARAM}([0-9]+)`

const router = express.Router()

router.param(ID_PARAM, UserHandler.retrieveEntity)

router.route('/')
  .get(UserHandler.getAll)
  .post(UserHandler.retrievePassword, UserHandler.create)

router.route(ID_PATH)
  .get(UserHandler.getOne)
  .patch(UserHandler.retrievePassword, UserHandler.merge)
  .put(UserHandler.update)
  .delete(UserHandler.delete)

module.exports = router
