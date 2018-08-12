const { Repository } = require('./db')
const {
  User,
  UserRole,
  DetailedInvoice,
  SimpleInvoice,
  Invoice
} = require('./core')

let john = new User({ firstName: 'jon', lastName: 'bar', email: 'jon@bar.com' })
let bob = new User({ firstName: 'bob', lastName: 'foo', email: 'bob@foo.com' })

/**
 * Setup the app prerequisites required before starting the server
 *
 * @returns {Promise}
 */
function setup () {
  switch (process.env.NODE_ENV) {
    case 'development':
/*	  
      return Repository.sync()
        .then(() => john.setPassword('123456'))
        .then((john) => john.setRole(UserRole.ADMIN))
        .then((john) => Repository.save(john))
        .then(() => console.log('Development setup done!'))
        .catch((err) => {
          console.log(err)
          process.exit(1)
        })
*/
      return Repository.sync()
        .then(() => john.setPassword('123456'))
        .then((john) => john.setRole(UserRole.ADMIN))
        .then((john) => Repository.save(john))
        .then((user) => { john = user })
        .then(() => Repository.save(new DetailedInvoice({
          user: john,
          description: 'Description',
          invoiceDate: new Date(),
          invoiceNumber: '123456',
          beneficiaryName: 'Beneficiary',
          beneficiaryRegistrationNumber: '12.34.56',
          items: [
              { description: 'A', quantity: 1, unitPrice: 1.00 },
              { description: 'B', quantity: 2, unitPrice: 2.00 },
              { description: 'C', quantity: 4, unitPrice: 2.50 }
          ]
        }), { include: [ 'items' ] }))
        .then(() => Repository.save(new SimpleInvoice({
          user: john,
          description: 'Description',
          invoiceDate: new Date(),
          invoiceNumber: '123456',
          beneficiaryName: 'Beneficiary',
          beneficiaryRegistrationNumber: '12.34.56',
          amount: 10
        })))
        .then(() => bob.setPassword('123456'))
        .then((bob) => Repository.save(bob))
        .then((user) => { bob = user })
        .then(() => Repository.save(new DetailedInvoice({
          user: bob,
          description: 'Description',
          invoiceDate: new Date(),
          invoiceNumber: '123456',
          beneficiaryName: 'Beneficiary',
          beneficiaryRegistrationNumber: '12.34.56',
          items: [
            { description: 'i1', quantity: 3, unitPrice: 3.00 },
            { description: 'i2', quantity: 4, unitPrice: 4.00 }
          ]
        }), { include: [ 'items' ] }))
        .then(() => Repository.find(Invoice))
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
