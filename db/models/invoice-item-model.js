const Sequelize = require('sequelize')
const datasource = require('../datasource')
const InvoiceModel = require('./invoice-model')

const InvoiceItemModel = datasource.define('invoiceItem', {
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

// InvoiceItemModel.belongsTo(InvoiceModel, { primaryKey: true, onDelete: 'cascade' })
InvoiceModel.hasMany(InvoiceItemModel, { as: 'items' })

InvoiceItemModel.addHook('beforeCreate', excludeAmount)
InvoiceItemModel.addHook('beforeUpdate', excludeAmount)

function excludeAmount (instance, options) {
  console.info('--- item ---')
}

module.exports = InvoiceItemModel
