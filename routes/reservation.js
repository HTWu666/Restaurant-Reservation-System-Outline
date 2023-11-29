import express from 'express'
import {
  createReservationByCustomer,
  createReservationByVendor,
  getReservations,
  cancelReservationByCustomer,
  cancelReservationByVendor,
  confirmReservation
} from '../controllers/reservation.js'
import authenticate from '../middlewares/authenticate.js'
import { parseUpnForReservation } from '../middlewares/parseUpn.js'

const router = express.Router()

// for business
router.post('/restaurant/:restaurantId(\\d+)/reservation', authenticate, createReservationByVendor)
router.get('/restaurant/:restaurantId(\\d+)/reservation', authenticate, getReservations)
router.put(
  '/restaurant/:restaurantId(\\d+)/reservation/:reservationId(\\d+)',
  authenticate,
  confirmReservation
)
router.delete(
  '/restaurant/:restaurantId(\\d+)/reservation/:reservationId(\\d+)',
  authenticate,
  cancelReservationByVendor
)

// for customer
router.post('/restaurant/:restaurantId(\\d+)/reservation/click', createReservationByCustomer) // 前端從 url 取得餐廳 id, 再回傳
router.delete('/reservation/click', parseUpnForReservation, cancelReservationByCustomer)

export default router