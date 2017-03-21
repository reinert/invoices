import express from 'express'
import { User } from '../domain'
import resource from './resource'

export default resource(User, '/users')