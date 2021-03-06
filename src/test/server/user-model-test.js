/* global describe beforeEach it */
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')

require('dotenv').config()

const { User } = require('../../core')
const { Repository } = require('../../db')

chai.use(chaiAsPromised)
const expect = chai.expect

describe('UserModel', () => {
  let user = null

  beforeEach(() => {
    user = new User({ email: 'test@email.com' })
  })

  it('save throws error when creating a user with email not set', () => {
    user.email = null
    let p = Repository.save(user)
    return expect(p).to.be.rejectedWith('email cannot be null')
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
