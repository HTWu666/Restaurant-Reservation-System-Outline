import pg from 'pg'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import * as SQS from '../utils/SQS.js'

dotenv.config({ path: '../.env' })

const { Pool } = pg
const pool = new Pool({
  user: process.env.POSTGRE_USER,
  host: process.env.POSTGRE_HOST,
  database: process.env.POSTGRE_DATABASE,
  password: process.env.POSTGRE_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
})

const writeBackToDB = async (
  availableSeatId,
  restaurantId,
  adult,
  child,
  diningDate,
  diningTime,
  tableId,
  tableName,
  name,
  gender,
  phone,
  email,
  purpose,
  note
) => {
  await pool.query(
    `
    UPDATE available_seats
    SET availability = FALSE
    WHERE id = $1
    `,
    [availableSeatId]
  )

  const { rows } = await pool.query(
    `
    INSERT INTO reservations (restaurant_id, adult, child, dining_date, dining_time,
      table_id, table_name, name, gender, phone, email, purpose, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id
    `,
    [
      parseInt(restaurantId, 10),
      adult,
      child,
      diningDate,
      diningTime,
      tableId,
      tableName,
      name,
      gender,
      phone,
      email,
      purpose,
      note
    ]
  )

  const reservationId = rows[0].id
  const payload = { reservationId }
  const upn = jwt.sign(payload, process.env.JWT_KEY)
  await pool.query(
    `
    UPDATE reservations
    SET upn = $1
    WHERE id = $2
    `,
    [upn, reservationId]
  )

  const mailMessage = {
    restaurantId,
    reservationId,
    adult,
    child,
    diningDate,
    diningTime,
    name,
    gender,
    email,
    upn
  }

  await SQS.sendMessage(
    process.env.NOTIFY_MAKING_RESERVATION_SUCCESSFULLY_SQS_QUEUE_URL,
    JSON.stringify(mailMessage)
  )

  return reservationId
}

const worker = async () => {
  try {
    console.log('[*] Waiting for messages in writeBackToDB. To exit press CTRL+C')
    while (true) {
      const message = await SQS.receiveMessage(process.env.CACHE_WRITE_BACK_QUEUE_URL)
      if (message) {
        console.log(`messagebody: ${message.Body}`)
        const {
          availableSeatId,
          restaurantId,
          adult,
          child,
          diningDate,
          diningTime,
          tableId,
          tableName,
          name,
          gender,
          phone,
          email,
          purpose,
          note
        } = JSON.parse(message.Body)

        const reservationId = await writeBackToDB(
          availableSeatId,
          restaurantId,
          adult,
          child,
          diningDate,
          diningTime,
          tableId,
          tableName,
          name,
          gender,
          phone,
          email,
          purpose,
          note
        )
        console.log(
          `Created reservation for reservationId: ${reservationId} with availableSeatId: ${availableSeatId}`
        )
      }
    }
  } catch (err) {
    console.error(err)
  }
}

worker()

const outputLogStream = fs.createWriteStream('./logs/console/cacheWriteBackConsole.log', {
  flags: 'a'
})

if (process.env.SERVER_STATUS === 'development') {
  const originalConsoleLog = console.log
  console.log = (...args) => {
    const message = args
      .map((arg) => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return 'Unstringifiable Object'
          }
        }
        return String(arg)
      })
      .join(' ')

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
