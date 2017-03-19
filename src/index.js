import express from 'express'
import bodyParser from 'body-parser'
import { users } from './routes'
import './pre-start' 

const app = express()

app.use(bodyParser.json({ type: 'application/json' }));

app.use('/users', users)

app.use(function errorHandler(err, req, res, next) {
  console.log('--- UNEXPECTED ERROR OCURRED ---')
  console.log(err)

  res.statusCode = 500
  res.end()
})

app.get('/', (req, res) => {
  res.end()
})

app.listen(3000, () => {
  console.log('App started on port 3000')
})
