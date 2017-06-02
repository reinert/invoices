const { errors: { NonexistentEntityError } } = require('../core')
const UserModel = require('./models/user-model')
const InvoiceModel = require('./models/invoice-model')
const InvoiceItemModel = require('./models/invoice-item-model')
const {
  User,
  Invoice,
  SimpleInvoice,
  DetailedInvoice,
  InvoiceItem
} = require('../core')

function getModel (Entity) {
  if (Entity === User) return UserModel
  if (Entity === Invoice) return InvoiceModel
  if (Entity === SimpleInvoice) return InvoiceModel
  if (Entity === DetailedInvoice) return InvoiceModel
  if (Entity === InvoiceItem) return InvoiceItemModel
  throw new NonexistentEntityError(Entity)
}

module.exports = getModel
