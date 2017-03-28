/* global describe beforeEach it */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import User from '../../src/domain/user'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('User', () => {
  let user = null

  beforeEach(() => {
    user = new User({ username: 'Test Name', email: 'test@email.com' })
  })

  it('isEncrypted is true when setPassword successfully', () => {
    let p = user.setPassword('123456')
    return expect(p).to.eventually.have.property('_isEncrypted', true)
  })

  it('comparePassword returns true when password matches', () => {
    let p = user.setPassword('123456').then((user) => user.comparePassword('123456'))
    return expect(p).to.eventually.be.true
  })

  it('comparePassword returns false when password does not match', () => {
    let p = user.setPassword('123456').then((user) => user.comparePassword('123'))
    return expect(p).to.eventually.be.false
  })

  it('comparePassword throws error when password has not been set', () => {
    let p = user.comparePassword('123456')
    return expect(p).to.be.rejectedWith('Password not encrypted yet')
  })
})

describe('UserRepository', () => {
  let user = null

  beforeEach(() => {
    user = new User({ username: 'Test Name', email: 'test@email.com' })
  })

  it('save throws error when creating a user with username not set', () => {
    user.username = null
    let p = User.Repository.save(user)
    return expect(p).to.be.rejectedWith('username cannot be null')
  })

  it('save throws error when creating a user with password not set', () => {
    let p = User.Repository.save(user)
    return expect(p).to.be.rejectedWith('password cannot be null')
  })

  it('save throws error when persisting a user with invalid email', () => {
    user.email = 'invalid-email'
    let p = User.Repository.save(user)
    return expect(p).to.be.rejectedWith('Not a valid email')
  })
})
