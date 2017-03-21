import Sequelize from 'sequelize'
import datasource from './datasource'

export default datasource.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: { msg: 'not a valid email' }
    }
  }  
})

