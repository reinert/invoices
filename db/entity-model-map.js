const { errors: { NonexistentEntityError } } = require('../core')
const UserModel = require('./models/user-model')
const InvoiceModel = require('./models/invoice-model')
const InvoiceItemModel = require('./models/invoice-item-model')
const {
  User,
  SimpleInvoice,
  DetailedInvoice,
  InvoiceItem
} = require('../core')

class EntityModelMap {
  static getModel (Entity) {
    if (Entity === User) return UserModel
    if (Entity === SimpleInvoice) return InvoiceModel
    if (Entity === DetailedInvoice) return InvoiceModel
    if (Entity === InvoiceItem) return InvoiceItemModel
    throw new NonexistentEntityError()
  }
}

module.exports = EntityModelMap
