const Sequelize = require('sequelize')
const datasource = require('../datasource')
const InvoiceModel = require('./invoice-model')

const InvoiceItemModel = datasource.define('invoiceItem', {
  invoice_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    references: {
      model: InvoiceModel,
      key: 'id'
    }
  },
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    set: function () {}
  },
  quantity: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  unitPrice: {
    field: 'unit_price',
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  description: {
    type: Sequelize.STRING
  },
  amount: {
    type: Sequelize.VIRTUAL
  }
})

InvoiceItemModel.belongsTo(InvoiceModel)
InvoiceModel.hasMany(InvoiceItemModel, { as: 'items' })

module.exports = InvoiceItemModel
