import Sequelize from 'sequelize'
import datasource from './datasource'

export default datasource.define('user', {
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: { msg: 'Not a valid email' }
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isString: function (value) {
        if (!(typeof value === 'string' || value instanceof String)) throw new Error('Password must be a string')
      }
    }
  },
  isEncrypted : {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    validate: {
      isTrue: function (value) {
        if (value !== true) throw new Error('Password must be encrypted before persisting the user')
      }
    }
  }
})
