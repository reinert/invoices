import Sequelize from 'sequelize'
import config from '../../config/datasource'

const env = process.env.NODE_ENV || 'development'
const conn = config[env]

export default new Sequelize(conn.database, conn.username, conn.password, {
  dialect: conn.dialect,
  host: conn.host,
  port: conn.port,
  pool: conn.pool
})
