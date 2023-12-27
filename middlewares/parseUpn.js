import jwt from 'jsonwebtoken'
import util from 'util'

const jwtVerify = util.promisify(jwt.verify)

const parseUpn = (type) => async (req, res, next) => {
  try {
    const { upn } = req.query
    if (!upn) {
      return res.status(400).json({ errors: 'no upn' })
    }

    const decoded = await jwtVerify(upn, process.env.JWT_KEY)

    if (type === 'reservation') {
      res.locals.reservationId = decoded.reservationId
    } else if (type === 'waitlist') {
      res.locals.waitingId = decoded.waitingId
    }

    next()
  } catch (err) {
    console.error(err)

    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' })
    }

    res.status(500).json({ errors: 'Parse upn failed' })
  }
}

export default parseUpn
