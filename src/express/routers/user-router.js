import express from 'express'
import { UserHandler } from '../handlers'

const ID_PARAM = 'id'
const ID_PATH = `/:${ID_PARAM}([0-9]+)`

export default express.Router()
    .get('/', UserHandler.getAll)
    .post('/', UserHandler.retrievePassword, UserHandler.create)
    .param(ID_PARAM, UserHandler.retrieveEntity)
    .get(ID_PATH, UserHandler.getOne)
    .patch(ID_PATH, UserHandler.retrievePassword, UserHandler.merge)
    .put(ID_PATH, UserHandler.update)
    .delete(ID_PATH, UserHandler.delete)
