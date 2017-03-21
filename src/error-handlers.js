export function validationErrorHandler(err, req, res, next) {
  if (err.name === 'SequelizeValidationError') {
  	err.type = 'VALIDATION'

    console.log('--- VALIDATION ERROR OCURRED ---')
    console.log(err.message)

    delete err.name
    
    res.status(400).json(err)
  }
}

export function uncaughtErrorHandler(err, req, res, next) {
  console.log('--- UNEXPECTED ERROR OCURRED ---')
  console.log(err)

  res.sendStatus(500).json({message: 'An unexpected error ocurred. Please try again later.'})
}