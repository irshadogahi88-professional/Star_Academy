const express = require('express')
const { submitAttempt, getAttemptResult, getStudentAnalytics, getAllSubmissions } = require('../controllers/attemptController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.get('/all', protect, authorize('teacher', 'admin'), getAllSubmissions)
router.post('/:testId/submit', protect, submitAttempt)
router.get('/:id/result', protect, getAttemptResult)
router.get('/analytics', protect, getStudentAnalytics)

module.exports = router
