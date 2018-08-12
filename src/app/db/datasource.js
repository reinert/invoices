const Sequelize = require('sequelize')

const dsPath = process.env.DATASOURCE_CONFIG || '../db/config'
const config = require(dsPath)

const env = process.env.NODE_ENV || 'development'
const con = config[env]

const datasource = new Sequelize(con.database, con.username, con.password, con)

module.exports = datasource
