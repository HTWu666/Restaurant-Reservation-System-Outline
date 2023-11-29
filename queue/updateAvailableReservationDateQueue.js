import pg from 'pg'
import dotenv from 'dotenv'
import amqp from 'amqplib'

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

const UPDATE_AVAILABLE_RESERVATION_DATE_QUEUE = 'updateAvailableReservationDateQueue'

const getTables = async (restaurantId) => {
  const { rows } = await pool.query(
    `
      SELECT
        tables.id AS table_id,
        tables.name,
        tables.seat_qty,
        table_available_time.available_time
      FROM tables
      INNER JOIN table_available_time
      ON tables.id = table_available_time.table_id
      WHERE tables.restaurant_id = $1
    `,
    [restaurantId]
  )
  return rows
}

const createAvailableSeats = async (restaurantId, maxBookingDay) => {
  const updatedDate = new Date()
  updatedDate.setDate(updatedDate.getDate() + maxBookingDay)
  const year = updatedDate.getFullYear()
  const month = updatedDate.getMonth() + 1
  const day = updatedDate.getDate()
  const formattedDate = `${year}-${month}-${day}`
  const tableData = await getTables(restaurantId)

  const values = tableData
    .map((row) => [
      restaurantId,
      row.table_id,
      row.name,
      row.seat_qty,
      formattedDate,
      row.available_time
    ])
    .flat()

  const placeholders = tableData
    .map(
      (_, i) =>
        `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
    )
    .join(', ')

  const { rows: availableSeatIds } = await pool.query(
    `
    INSERT INTO available_seats (
        restaurant_id,
        table_id,
        table_name,
        seat_qty,
        available_date,
        available_time
    ) VALUES ${placeholders}
    `,
    values
  )

  return availableSeatIds
}

// 依照 rule 更新可訂位的日期
const worker = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_SERVER)
    const channel = await connection.createChannel()
    const queueName = UPDATE_AVAILABLE_RESERVATION_DATE_QUEUE

    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queueName)

    await channel.consume(
      queueName,
      async (job) => {
        if (job !== null) {
          const { restaurantId, maxBookingDay } = JSON.parse(job.content.toString())
          channel.ack(job)
          createAvailableSeats(restaurantId, maxBookingDay)
          console.log('Successfully updated the available reservation date')
          console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queueName)
        }
      },
      { noAck: false }
    )
  } catch (err) {
    console.error(err)
  }
}

worker()