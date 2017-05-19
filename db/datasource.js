const Sequelize = require('sequelize')
const config = require('../config/datasource')
const readOnlyPlugin = require('./plugins/readonly-plugin')

const env = process.env.NODE_ENV || 'development'
const con = config[env]

const datasource = new Sequelize(con.database, con.username, con.password, con)

readOnlyPlugin(datasource)
readOnlyPlugin(datasource)

module.exports = datasource
