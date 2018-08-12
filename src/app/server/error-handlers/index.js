const apiErrorHandler = require('./api-error-handler')
const sequelizeErrorHandler = require('./sequelize-error-handler')
const uncaughtErrorHandler = require('./uncaught-error-handler')

module.exports = {
  apiErrorHandler,
  sequelizeErrorHandler,
  uncaughtErrorHandler
}
