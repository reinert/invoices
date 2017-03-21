import express from 'express'
import bodyParser from 'body-parser'
import { users } from './routes'
import './pre-start' 

const app = express()

app.use(bodyParser.json({ type: 'application/json' }));

app.use('/users', users)

app.use(validationErrorHandler)

app.get('/', (req, res) => {
  res.send('Hello World! \o/')
})

app.listen(3000, () => {
  console.log('App started on port 3000')
})

function validationErrorHandler(err, req, res, next) {
  if (err.name === 'SequelizeValidationError') {
  	err.type = 'VALIDATION'

    console.log('--- VALIDATION ERROR OCURRED ---')
    console.log(err.message)

    delete err.name
    
    res.status(400).json(err)
  }
}

function uncaughtErrorHandler(err, req, res, next) {
  console.log('--- UNEXPECTED ERROR OCURRED ---')
  console.log(err)

  res.sendStatus(500).json({message: 'An unexpected error ocurred. Please try again later.'})
}
