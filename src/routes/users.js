import express from 'express'
import { User } from '../domain'

export default express.Router()
  .get('/', (req, res, next) => {
    User.Repository.findAll()
      .then((users) => res.json(users))
      .catch(next)
  })

