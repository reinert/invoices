import Sequelize from 'sequelize'

export default new Sequelize('temp', 'postgres', 'postgres', {
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
