import pg from 'pg'
import dotenv from 'dotenv'

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

const num = parseInt(process.argv[2], 10)

const restaurantId = 1
const tableId = 18
const tableName = 'A6'
const seatQty = 2
const availableDate = '2023-12-25'
const availableTime = '04:00'
const availability = true

const bulkCreate = async () => {
  const values = []
  for (let i = 0; i < num; i++) {
    values.push(
      `(${restaurantId}, ${tableId}, '${tableName}', ${seatQty}, '${availableDate}', '${availableTime}', ${availability})`
    )
  }

  const query = `
    INSERT INTO available_seats (restaurant_id, table_id, table_name, seat_qty, available_date, available_time, availability)
    VALUES ${values.join(', ')}
  `

  await pool.query(query)
}

await bulkCreate()
console.log('create done')
