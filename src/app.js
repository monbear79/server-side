'use strict'

require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const { default: helmet } = require('helmet')
const compression = require('compression')
const cors = require('cors')
const app = express()

const allowedOrigins = [
    'http://localhost:3000',
    'https://nhom9-chuyendeweb.netlify.app'
  ];
  
  app.use(cors({
      origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl)
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
              return callback(null, true);
          } else {
              return callback(new Error('Not allowed by CORS'));
          }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'authorization', 'x-client-id', 'x-rtoken-id'],
      credentials: true
  }));
//init middlewares
app.use(morgan("dev"))
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' }  
    })
)
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'));
//init db
require('./dbs/init.mongodb')
// const { checkOverload } = require ('./helpers/check.connect')
// checkOverload()

//init routes
const accessRouter = require('./routes/access')
const productRouter = require('./routes/product')
app.use('/v1/api', accessRouter)
app.use('/v1/api/product', productRouter)


//handle error

app.use((req, res, next) => { //middleware chi co 3 tham so, ham quan ly loi thi co 4 tham so
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    const status = error.status || 500
    return res.status(status).json({
        status: 'error',
        code: status,
        // stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})
// app.set('x-powered-by', false);  

module.exports = app