import Sequelize from 'sequelize'

const seq = new Sequelize('temp', 'postgres', 'postgres', {
  host: 'localhost',
  //host: '127.0.0.1',
  //port: 5432,
  //dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  dialect: 'sqlite'
  //storage: `${__dirname}/data/temp.sqlite`
})

export { seq as modelFactory, seq as sequelize }

//const seq = new Sequelize('postgres://postgres:postgres@127.0.0.1:5432/temp')

seq.authenticate()
  .then((err) => console.log('Connection established'))
  .catch((err) => console.log('Unable to connect:', err))
