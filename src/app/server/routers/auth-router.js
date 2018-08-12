const { AuthHandler, UserHandler } = require('../handlers')
const express = require('express')

const router = express.Router()

router.route('/')
  .get(UserHandler.retrievePassword, AuthHandler.signin)
  .delete(AuthHandler.signout)

module.exports = router
