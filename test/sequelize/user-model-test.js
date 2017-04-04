/* global describe beforeEach it */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { User } from '../../src/core'
import { Repository } from '../../src/sequelize'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('UserModel', () => {
  let user = null

  beforeEach(() => {
    user = new User({ username: 'Test Name', email: 'test@email.com' })
  })

  it('save throws error when creating a user with username not set', () => {
    user.username = null
    let p = Repository.save(user)
    return expect(p).to.be.rejectedWith('username cannot be null')
  })

  it('save throws error when creating a user with password not set', () => {
    let p = Repository.save(user)
    return expect(p).to.be.rejectedWith('password cannot be null')
  })

  it('save throws error when persisting a user with invalid email', () => {
    user.email = 'invalid-email'
    let p = Repository.save(user)
    return expect(p).to.be.rejectedWith('Not a valid email')
  })
})
