import Sequelize from 'sequelize'
import config from '../../config/datasource'

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development'

const conn = config[process.env.NODE_ENV]

export default new Sequelize(conn.database, conn.username, conn.password, {
  dialect: conn.dialect,
  host: conn.host,
  port: conn.port,
  pool: conn.pool
})
