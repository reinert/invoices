import { User } from './domain'

let user = new User({username: 'john', password: '123456', email: 'dsadsa@dsa.com'})
console.log(`>> the user: ${user}`)

// force: true will drop the table if it already exists
User.Repository.sync({force: true}).then((repo) => {
  //console.log(repo)
  // Table created
  //return User.Repository.create(user)
  return User.Repository.save(user)
}).then((user) => {
  //console.log('>>>>>>>>>>>>>>>')
  //console.log(user)  
//  console.log(`user created: ${new User(user)}`)
  return User.Repository.findById(user.id)
}).then((user) => {
  console.log('::: RESULT :::')
  console.log(JSON.stringify(user))
}).catch((err) => console.log(err)) 
