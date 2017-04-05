const { AuthHandler, UserHandler } = require('../handlers')
const express = require('express')

const router = express.Router()

router.route('/login')
  .head(UserHandler.retrievePassword, AuthHandler.login)

module.exports = router
