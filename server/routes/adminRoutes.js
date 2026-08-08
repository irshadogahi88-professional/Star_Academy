const express = require('express')
const router = express.Router()
const {
  getStudents,
  updateStudentStatus,
  approveStudent,
  declineStudent,
  resetStudentPassword,
  getAdminMetrics,
  getPublicStats,
  getTeacherMetrics,
  getStaffAccounts,
  deleteStaffAccount,
  assignUserRole,
} = require('../controllers/adminController')
const { protect, authorize } = require('../middleware/auth')

// Public stats route
router.get('/public-stats', getPublicStats)

// Protect all following routes
router.use(protect)

// Admin/Director only endpoints
router.patch('/students/:id/role', authorize('admin', 'director'), assignUserRole)
router.post('/students/:id/reset-password', authorize('admin', 'director'), resetStudentPassword)
router.patch('/students/:id/status', authorize('admin', 'director'), updateStudentStatus)
router.get('/staff', authorize('admin', 'director'), getStaffAccounts)
router.delete('/staff/:id', authorize('admin', 'director'), deleteStaffAccount)

// Clerk/Admin/Director endpoints for student management & approvals
router.get('/students', authorize('admin', 'director', 'clerk', 'teacher'), getStudents)
router.patch('/students/:id/approve', authorize('admin', 'director', 'clerk'), approveStudent)
router.patch('/students/:id/decline', authorize('admin', 'director', 'clerk'), declineStudent)
router.patch('/students/:id/fee-status', authorize('admin', 'director', 'clerk'), require('../controllers/adminController').updateFeeStatus)
router.patch('/students/:id/voucher', authorize('admin', 'director', 'clerk'), require('../controllers/adminController').updateVoucher)

// Metrics endpoints
router.get('/metrics', authorize('admin', 'director', 'clerk'), getAdminMetrics)
router.get('/teacher-metrics', authorize('admin', 'director', 'teacher'), getTeacherMetrics)

module.exports = router
