const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config({path: './config.env'})
const app = express()
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const init = require('./app/initializator/initialFunct')
const mysql = require('mysql2/promise')
const compression = require('compression')
const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

// const resourcesFolderPath =
//   process.env.home + process.env.username + process.env.pathDocker + process.env.resources
const resourcesFolderPath = path.resolve(__dirname, './resources/')
const picResourceFolderPath = path.join(resourcesFolderPath)
// const demoPath = '/home/ubuntu/YT/Video_Summarization/demo/'

const demoPath = path.resolve(__dirname, './../../YT/Video_Summarization/demo/')
const outputPath = '/home/Video_Summarization/demo/darknet/';

app.use(compression())

if (process.env.NODE_ENV === 'production') {
  const corsOptions = {
    origin: [
      `http://${process.env.my_ip}:4200`,
      `${process.env.app_url}`,
      `http://${process.env.my_ip}`
    ]
  }
  app.use(cors(corsOptions))
  console.log(`Running on Production for http://${process.env.my_ip}:4200`)
} else {
  console.log(`Running Dev version on port ${process.env.PORT}`)
}

function customHeaders(req, res, next) {
  app.disable('X-Powered-By')
  res.setHeader('X-Powered-By', 'Graymatics-server')

  res.setHeader('Content-Security-Policy', "default-src 'self'")

  res.setHeader('X-Frame-Options', 'SAMEORIGIN')

  next()
}

app.use(customHeaders)

// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '10mb', extended: true}))
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.all(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', `http://${process.env.my_ip}`)
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, x-access-token'
  )
  next()
})

app.use(
  morgan(
    'Method: :method:url // Url: :remote-addr // Status::status // User-agent: :user-agent // Date: :date[web]'
  )
)
app.use(
  morgan(
    'Date: :date[web] // Url: :remote-addr // Method: :method:url // Status::status // User-agent: :user-agent',
    {
      stream: fs.createWriteStream('./access.log', {flags: 'a'})
    }
  )
)

const db = require('./app/models')

process.on('unhandledRejection', (error, promise) => {
  console.log(' Oh Lord! We forgot to handle a promise rejection here: ', promise)
  console.log(' The error was: ', error)
})

process.on('uncaughtException', function (err, promise) {
  console.log(' Oh Lord! We forgot to handle a promise rejection here: ', promise)
  console.log(' The error was: ', err)
})

if (process.env.INSTALL === 'true') {
  mysql
    .createConnection({
      user: process.env.USERM,
      password: process.env.PASSWORD,
      host: process.env.HOST
    })
    .then(connection => {
      connection.query('CREATE DATABASE IF NOT EXISTS ' + process.env.DB + ';').then(() => {
        db.sequelize.sync({force: true}).then(() => {
          console.log('Drop and Resync Db')
          init.initial()
          connection.query(
            'CREATE TABLE IF NOT EXISTS ' +
              process.env.DB +
              '.tickets (`id` varchar(45) NOT NULL,`type` varchar(45) NOT NULL,`createdAt`datetime NOT NULL, `updatedAt` datetime NOT NULL, `assigned` varchar(45) DEFAULT NULL, `id_account` varchar(45) NOT NULL, `id_branch` varchar(45) NOT NULL, `level` int(10) NOT NULL,`reviewed` varchar(45) DEFAULT NULL, `assignedBy` varchar(45) DEFAULT NULL, PRIMARY KEY (`id`), UNIQUE KEY `id_UNIQUE` (`id`)) ENGINE=InnoDB DEFAULT CHARSET=latin1; CREATE TABLE ' +
              process.env.DB +
              '.`alerts` (`id` VARCHAR(45) NOT NULL,`time` DATETIME NULL,`alert` VARCHAR(45) NULL,`cam_name` VARCHAR(45) NULL,`cam_id` VARCHAR(45) NULL,`trackid` INT NULL,`alert_type` INT NULL,`id_account` VARCHAR(45) NULL,`id_branch` VARCHAR(45) NULL, PRIMARY KEY (`id`));'
          )
        })
      })
    })
}

const opt = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Graymatics API',
      version: '5.0.2',
      description: 'Graymatics API Information',
      // license: {
      //   name: "MIT",
      //   url: "https://spdx.org/licenses/MIT.html",
      // },
      contact: {
        name: 'Graymatics',
        url: 'https://www.graymatics.com',
        email: 'alex@graymatics.com'
      }
    },
    servers: [
      {
        url: `${process.env.app_url}`,
        description: 'Main'
      },
      {
        url: 'localhost:3311',
        description: 'Other'
      }
    ]
  },
  apis: ['server.js', './app/routes/*.js']
}

const swaggerDocs = swaggerJsDoc(opt)

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    explorer: true,
    customCss: `img[alt='Swagger UI'] { content:url(${process.env.app_url}/api/pictures/graymaticsLogo.png);}`,
    customSiteTitle: 'Graymatics API Manual',
    customfavIcon: `${process.env.app_url}/api/pictures/favicon1.ico`,
    swaggerOptions: {
      url: `${process.env.app_url}/api/pictures/swagger.json`,
      docExpansion: 'none',
      validatorUrl: null
    },
    apis: ['server.js', './app/routes/*.js']
  })
)

// if (1 === 2) {
//   const doc = YAML.dump(swaggerDocs)
//   fs.writeFileSync('./resources/swagger.yaml', doc, 'utf8')
// }

// routes
require('./app/routes/video.routes')(app)

// resources being served
app.use('/api/pictures', express.static(picResourceFolderPath))

app.use('/assets/video', express.static(demoPath))

app.use('/assets/output', express.static(outputPath))

// client side
// app.use(express.static(process.env.WEBSITE_PATH));

// // 404 re-route
// app.get('*', function(req,res){
//     res.redirect('/');
//   });

module.exports = app
