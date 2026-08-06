const express = require('express')
const {
  register: registerUser,
  login: loginUser,
  getMe,
  logout,
  updateProfile,
  changePassword,
} = require('../controllers/authController')
const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
})
const { protect } = require('../middleware/auth')

const router = express.Router()

router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/me', protect, getMe)
router.get('/logout', protect, logout)
router.patch('/profile', protect, updateProfile)
router.post('/change-password', protect, changePassword)

module.exports = router


