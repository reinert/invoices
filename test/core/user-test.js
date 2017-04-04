/* global describe beforeEach it */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { User } = require('../../core')

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
    let p = user.setPassword('123456')
      .then((user) => user.comparePassword('123456'))
    return expect(p).to.eventually.be.true
  })

  it('comparePassword returns false when password does not match', () => {
    let p = user.setPassword('123456')
      .then((user) => user.comparePassword('123'))
    return expect(p).to.eventually.be.false
  })

  it('comparePassword throws error when password has not been set', () => {
    let p = user.comparePassword('123456')
    return expect(p).to.be.rejectedWith('Password not encrypted yet')
  })
})
