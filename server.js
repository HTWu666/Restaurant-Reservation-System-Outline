import express from 'express'
import dotenv from 'dotenv'
// import swaggerAutogen from 'swagger-autogen'
import cookieParser from 'cookie-parser'
import fs from 'fs'
import morganBody from 'morgan-body'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from './swagger.json' assert { 'type': 'json' }
import userRouter from './routes/user.js'
import restaurantRouter from './routes/restaurant.js'
import tableRouter from './routes/table.js'
import reservationRouter from './routes/reservation.js'

dotenv.config()
const app = express()

app.use(express.json()) // parse json
app.use(express.urlencoded({ extended: false })) // parse urlencoded
app.use(cookieParser()) // parse cookie
app.set('view engine', 'ejs')

// swagger
// const outputFile = './swagger.json'
// const endpointsFiles = ['./server.js']
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const log = fs.createWriteStream('./logs/morganBody/morganBody.log', {
  flags: 'a'
})
morganBody(app, {
  noColors: true,
  stream: log
})

app.use('/api', [userRouter, restaurantRouter, tableRouter, reservationRouter])

app.all('*', (req, res) => {
  res.status(404).render('./error/notFound')
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(err)
})

app.listen(process.env.PORT, () => {
  console.log(`Server is listening on ${process.env.PORT}`)
})

const outputLogStream = fs.createWriteStream('./logs/console/console.log', {
  flags: 'a'
})

if (process.env.SERVER_STATUS === 'development') {
  const originalConsoleLog = console.log
  console.log = (...args) => {
    const message = args.join(' ')
    outputLogStream.write(`${message}\n`)
    originalConsoleLog(...args)
  }

  const originalConsoleError = console.error
  console.error = (...args) => {
    const message = args.join(' ')
    outputLogStream.write(`[ERROR] ${message}\n`)

    args.forEach((arg) => {
      if (arg instanceof Error) {
        outputLogStream.write(`[ERROR Stack Trace] ${arg.stack}\n`)
      }
    })

    originalConsoleError(...args)
  }
}

// swaggerAutogen(outputFile, endpointsFiles)
