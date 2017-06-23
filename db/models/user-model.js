const datasource = require('../datasource')
const Sequelize = require('sequelize')

const UserModel = datasource.define('user', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: { msg: 'Not a valid email' }
    }
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      isString: function (value) {
        if (!(typeof value === 'string' || value instanceof String)) {
          throw new Error('Password must be a string')
        }
      }
    }
  },
  isEncrypted: {
    field: 'encrypted',
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    validate: {
      isTrue: function (value) {
        if (value !== true) {
          throw new Error(
            'Password must be encrypted before persisting the user')
        }
      }
    }
  },
  firstName: {
    field: 'first_name',
    type: Sequelize.STRING,
    allowNull: false
  },
  lastName: {
    field: 'last_name',
    type: Sequelize.STRING
    // allowNull: false
  },
  role: {
    type: Sequelize.ENUM,
    values: ['NORMAL', 'ADMIN'],
    allowNull: false,
    defaultValue: 'NORMAL'
  }
}, { schema: 'auth' })

module.exports = UserModel
