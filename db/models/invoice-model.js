const Sequelize = require('sequelize')
const datasource = require('../datasource')
const UserModel = require('./user-model')

const InvoiceModel = datasource.define('invoice', {
  type: {
    type: Sequelize.ENUM,
    values: ['SIMPLE', 'DETAILED'],
    allowNull: false
  },
  amount: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  invoiceDate: {
    field: 'invoice_date',
    type: Sequelize.DATE,
    allowNull: false
  },
  invoiceNumber: {
    field: 'invoice_number',
    type: Sequelize.STRING
  },
  beneficiaryName: {
    field: 'beneficiary_name',
    type: Sequelize.STRING
  },
  beneficiaryRegistrationNumber: {
    field: 'beneficiary_registration_number',
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  userId: {
    field: 'user_id',
    type: Sequelize.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
    references: {
      model: UserModel,
      key: 'id'
    }
  },
  user: {
    type: Sequelize.VIRTUAL,
    set: function (user) {
      this.setDataValue('userId', user.id)
      this.setDataValue('user', user)
    }
  }
})

InvoiceModel.addHook('beforeCreate', excludeAmount)
InvoiceModel.addHook('beforeUpdate', excludeAmount)
InvoiceModel.addHook('afterCreate', restoreAmount)
InvoiceModel.addHook('afterUpdate', restoreAmount)

function excludeAmount (instance, options) {
  if (instance.type === 'DETAILED') {
    options.fields.splice(options.fields.indexOf('amount'), 1)
    instance._previousAmount = instance.amount
  }
}

function restoreAmount (instance, options) {
  if (instance.type === 'DETAILED') {
    instance.amount = instance._previousAmount
  }
}

module.exports = InvoiceModel
