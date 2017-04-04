import { Repository } from './sequelize'
import { User } from './core'

export default () => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return Repository.sync({force: true})
        .then(() => new User({username: 'john', email: 'john@bar.com'}).setPassword('123456'))
        .then((user) => Repository.save(user))
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
