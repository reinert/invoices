import { datasource } from './persistence'
import { User } from './domain'

let john = new User({username: 'john', email: 'john@bar.com'})

datasource.sync({force: true})
  .then(() => {
    console.log('DB synced')
    return john.setPassword('123456')
  })
  .then((user) => {
  	return User.Repository.save(user)
  })
  .then((user) => {
    return user.comparePassword('123456')
  })
  .then((isEquals) => {
    console.log('Password matches:', isEquals)
  })
  .catch((err) => {
    console.log('Error while syncing DB...')
    console.log(err)
    return err;
  }) 
