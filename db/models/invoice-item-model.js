const Sequelize = require('sequelize')
const datasource = require('../datasource')
const InvoiceModel = require('./invoice-model')

const InvoiceItemModel = datasource.define('invoiceItem', {
  // This field is necessary to sequelize understand a double PK
  invoice_id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    onDelete: 'CASCADE',
    references: {
      model: InvoiceModel,
      key: 'id'
    }
  },
  invoiceId: {
    type: Sequelize.VIRTUAL,
    get: function () {
      return this.getDataValue('invoice_id')
    },
    set: function (id) {
      return this.setDataValue('invoice_id', id)
    }
  },
  invoice: {
    type: Sequelize.VIRTUAL,
    set: function (invoice) {
      if (!invoice) return false
      this.setDataValue('invoice_id', invoice.id)
      this.setDataValue('invoice', invoice)
    }
  },
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
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

InvoiceModel.hasMany(InvoiceItemModel, { as: 'items' })

module.exports = InvoiceItemModel
