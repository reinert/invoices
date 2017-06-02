const { Repository } = require('./db')
const {
  User,
  DetailedInvoice,
  SimpleInvoice,
  Invoice
} = require('./core')

let john = new User({ firstName: 'john', lastName: 'bar', email: 'john@bar.com' })
let bob = new User({ firstName: 'bob', lastName: 'foo', email: 'bob@foo.com' })

/**
 * Setup the app prerequisites required before starting the server
 *
 * @returns {Promise}
 */
function setup () {
  switch (process.env.NODE_ENV) {
    case 'development':
      return Repository.sync({ force: true })
        .then(() => john.setPassword('123456'))
        .then((john) => Repository.save(john))
        .then((user) => { john = user })
        .then(() => Repository.save(new DetailedInvoice({
          user: john,
          invoiceDate: new Date(),
          items: [
              { description: 'A', quantity: 1, unitPrice: 1.00 },
              { description: 'B', quantity: 2, unitPrice: 2.00 },
              { description: 'C', quantity: 4, unitPrice: 2.50 }
          ]
        }), { include: [ 'items' ] }))
        .then((invoice) => console.log('DETAILED ==>', JSON.stringify(invoice, null, 2), '\n'))
        .then(() => Repository.save(new SimpleInvoice({ user: john, amount: 10, invoiceDate: new Date() })))
        .then((invoice) => console.log('SIMPLE ==>', JSON.stringify(invoice, null, 2), '\n'))
        .then(() => bob.setPassword('123456'))
        .then((bob) => Repository.save(bob))
        .then((user) => { bob = user })
        .then(() => Repository.save(new DetailedInvoice({
          user: bob,
          invoiceDate: new Date(),
          items: [
            { description: 'i1', quantity: 3, unitPrice: 3.00 },
            { description: 'i2', quantity: 4, unitPrice: 4.00 }
          ]
        }), { include: [ 'items' ] }))
        .then((invoice) => console.log('DETAILED ==>', JSON.stringify(invoice, null, 2), '\n'))
        .then(() => Repository.find(Invoice))
        .then((invoices) => { console.log(invoices); console.log(JSON.stringify(invoices, null, 2)) })
        .then(() => console.log('Development setup done!'))
        .catch((err) => {
          console.log('Error while syncing DB...')
          console.log(err)
          process.exit(1)
        })
    case 'test':
      console.error('Test environment not yet implemented!')
      process.exit(0)
      break
    case 'production':
      console.log('Production environment not yet implemented!')
      process.exit(0)
      break
    default:
      console.log('Invalid environment:', process.env.NODE_ENV)
      process.exit(1)
  }
}

module.exports = setup
