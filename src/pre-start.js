import { datasource } from './persistence'
import { User } from './domain'

let john = new User({username: 'john', password: '123456', email: 'john@bar.com'})

datasource.sync({force: true})
  .then(() => {
  	console.log('DB synced')
  	User.Repository.save(john)
  })
  .catch((err) => {
    console.log('Error while syncing DB...')
    console.log(err)
  }) 
