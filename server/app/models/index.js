require('dotenv').config({path: '../../config.env'})
const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env.DB, process.env.USERM, process.env.PASSWORD, {
  host: process.env.HOST,
  port: process.env.DB_PORT,
  dialect: process.env.DIALECT,
  operatorsAliases: 0,
  logging: false
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

db.user = require('../models/user.model.js')(sequelize, Sequelize)
db.algorithm = require('../models/algorithm.model.js')(sequelize, Sequelize)
db.tickets = require('../models/tickets.model.js')(sequelize, Sequelize)
db.alerts = require('../models/alerts.model.js')(sequelize, Sequelize)
db.progress = require('../models/progress.model.js')(sequelize, Sequelize)

db.algorithm.belongsToMany(db.user, {
  through: 'account_algorithm',
  foreignKey: 'algoId',
  otherKey: 'accountId'
})
db.user.belongsToMany(db.algorithm, {
  through: 'account_algorithm',
  foreignKey: 'accountId',
  otherKey: 'algoId'
})

db.ALGORITHMS = [
  'Facial Recognition',
  'Person Climbing Barricade',
  'Loitering Detection',
  'D&C of human, animal and vehicle',
  'Parking Violation',
  'Speeding Vehicle',
  'Helmet detection on two-wheeler',
  'Banned vehicle detection',
  'Wrong way or illegal turn detection',
  'Graffiti & Vandalism detection',
  'Debris & Garbage detection',
  'Garbage bin, cleanned or not',
  'People Count',
  'ANPR',
  'Heatmap',
  'Demographics',
  'Abandoned Object',
  'Intrusion Alert',
  'Attendance Management',
  'Violence',
  'No Mask',
  'Social Distancing',
  'Queue Management',
  'Helmet Detection',
  'Vault Open',
  'Barrier Not Closed',
  'Vehicle Counting',
  'Camera Tampering',
  'Animals On Road',
  'Animal Detection',
  'Accident Detection',
  'Axle Detection',
  'Axle Count',
  'Car make Classification',
  'Carmake',
  'Clothing',
  'Vehicle Count at Screen',
  'Car Brand',
  'Weapon',
  'Bottle',
  'People Path',
  'Person Collapsing',
  'Fire Detection'
]

module.exports = db
