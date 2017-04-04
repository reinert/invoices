const ENV = process.env.NODE_ENV
if (ENV !== 'production' && ENV !== 'development') {
  console.error(`Invalid NODE_ENV value: ${ENV}`)
  process.exit(1)
}
