import express from 'express'
import { User } from '../domain'
import { createLookup } from './util'

const lookup = createLookup(User.Repository)

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
  .get('/:id([0-9]+)', lookup, (req, res, next) => {
    User.Repository.findById(req.params.id)
      .then((user) => log(user))
      .then((user) => user == null ? res.sendStatus(404) : res.json(user))
      .catch(next)
  })
  .patch('/:id([0-9]+)', lookup, (req, res, next) => {
    User.Repository.save(req.entity.merge(req.body))
      .then((user) => log(user))
      .then((user) => res.json(user))
      .catch(next)
  })
  .put('/:id([0-9]+)', lookup, (req, res, next) => {
    User.Repository.save(req.entity.update(req.body))
      .then((user) => log(user))
      .then((user) => res.json(user))
      .catch(next)
  })
  .delete('/:id([0-9]+)', lookup, (req, res, next) => {
    User.Repository.destroy(req.entity)
      .then(() => res.sendStatus(200))
      .catch(next)
  })

function log (user) {
  console.dir(user)
  return user
}