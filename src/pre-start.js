import { sequelize } from './persistence'
import { User } from './domain'

let john = new User({username: 'john', password: '123456', email: 'dsadsa@dsa.com'})

// force: true will drop the table if it already exists
sequelize.sync({force: true}).then(() => {
  // Table created
  return User.Repository.save(john)
}).then(() => {
  console.log('DB synced')
}).catch((err) => {
  console.log('Error while syncing DB...')
  console.log(err)
}) 
