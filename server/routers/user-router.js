const express = require('express')
const { AuthHandler, UserHandler } = require('../handlers')

const ID_PARAM = UserHandler.ID_PARAM
const ID_PATH = `/:${ID_PARAM}([0-9]+)`

const router = express.Router()

router.use(UserHandler.retrieveOptions)
router.param(ID_PARAM, UserHandler.retrieveEntity)

router.route('/')
  .get(AuthHandler.requireAdmin, UserHandler.getAll)
  .post(UserHandler.retrievePassword, UserHandler.create)

router.route(ID_PATH)
  .all(AuthHandler.requireIdentity)
  .get(UserHandler.getOne)
  .patch(UserHandler.retrievePassword, UserHandler.merge)
  .put(UserHandler.update)
  .delete(AuthHandler.requireAdmin, UserHandler.delete)

module.exports = router
