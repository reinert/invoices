import { datasource } from './persistence'
import { User } from './domain'

const env = process.env.NODE_ENV || 'development'

switch (env) {
  case 'development':
    datasource.sync({force: true})
      .then(() => new User({username: 'john', email: 'john@bar.com'}).setPassword('123456'))
      .then((user) => User.Repository.save(user))
      .then(() => console.log('Development setup done!'))
      .catch((err) => {
        console.log('Error while syncing DB...')
        console.log(err)
        process.exit(1)
      })
    break
  case 'test':
    console.log('Not yet implemented!')
    process.exit(0)
    break
  case 'production':
    console.log('Not yet implemented!')
    process.exit(0)
    break
  default:
    console.log('NODE_ENV not set.')
    process.exit(1)
}


