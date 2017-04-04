const config = require('../config/datasource')
const Sequelize = require('sequelize')

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

const conn = config[process.env.NODE_ENV]

const datasource = new Sequelize(conn.database, conn.username, conn.password, {
  dialect: conn.dialect,
  host: conn.host,
  port: conn.port,
  pool: conn.pool
})

module.exports = datasource
