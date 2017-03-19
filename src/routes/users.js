import express from 'express'
import { User } from '../domain'

export default express.Router()
  .get('/', (req, res, next) => {
    User.Repository.findAll()
      .then((users) => res.json(users))
      .catch(next)
  })
  .post('/', (req, res, next) => {
    User.Repository.save(new User(req.body))
      .then((user) => res.status(201).location(`${req.baseUrl}/${user.id}`).json(user))
      .catch(next)
  })
  .get('/:id([0-9]+)', (req, res, next) => {
    User.Repository.findById(req.params.id)
      .then((user) => log(user))    
      .then((user) => user == null ? res.sendStatus(404) : res.json(user))
      .catch(next)
  })

function log (user) {
  console.dir(user)
  return user
}
