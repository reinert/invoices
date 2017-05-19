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
    defaultValue: 0.00
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
  }
})

InvoiceModel.belongsTo(UserModel)

module.exports = InvoiceModel
