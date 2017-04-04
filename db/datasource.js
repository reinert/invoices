const config = require('../config/datasource')
const Sequelize = require('sequelize')

const env = process.env.NODE_ENV || 'development'
const conn = config[env]

const datasource = new Sequelize(conn.database, conn.username, conn.password, {
  dialect: conn.dialect,
  host: conn.host,
  port: conn.port,
  pool: conn.pool
})

module.exports = datasource
