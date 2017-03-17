import { User } from './domain'

let user = new User({username: 'john', password: '123456', email: 'dsadsa@dsa.com'})
console.log(`>> the user: ${user}`)

// force: true will drop the table if it already exists
User.Repository.sync({force: true}).then((repo) => {
  // Table created
  return User.Repository.save(user)
}).then((user) => {
  // Entity persisted
  return User.Repository.findById(user.id)
}).then((user) => {
  // Entity found by id
  console.log('::: RESULT :::')
  console.log(JSON.stringify(user))

  return User.Repository.findAll()
}).then((users) => {
  console.log(JSON.stringify(users))
}).catch((err) => console.log(err)) 
