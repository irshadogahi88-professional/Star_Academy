const User = require('../models/User')
const Submission = require('../models/Submission')
const Lecture = require('../models/Lecture')
const Test = require('../models/Test')
const MCQ = require('../models/MCQ')
const { logAudit } = require('../middleware/auditLogger')

// @desc    Get all registered students
// @route   GET /api/admin/students
// @access  Private (Admin / Director)
exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 })
    res.json({
      success: true,
      count: students.length,
      students,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Approve student account access
// @route   PATCH /api/admin/students/:id/approve
// @access  Private (Admin / Director / Clerk)
exports.approveStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    student.isApproved = true
    await student.save()
    await logAudit(req, 'APPROVE_STUDENT', 'User', student._id, `Approved admission access for ${student.fullName}`)
    res.json({ success: true, message: `Approved ${student.fullName} access.`, student })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update student fee status
// @route   PATCH /api/admin/students/:id/fee-status
// @access  Private (Clerk, Admin)
exports.updateFeeStatus = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    const { status } = req.body
    if (status !== 'paid' && status !== 'unpaid') {
      return res.status(400).json({ success: false, message: 'Invalid fee status' })
    }
    
    student.feeStatus = status
    await student.save()
    await logAudit(req, 'UPDATE_FEE_STATUS', 'User', student._id, `Updated fee status to ${status} for ${student.fullName}`)
    res.json({ success: true, message: `Updated fee status to ${status}.`, student })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update student voucher details
// @route   PATCH /api/admin/students/:id/voucher
// @access  Private (Clerk, Admin)
exports.updateVoucher = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    const { feeAmount, feeDueDate, feeDescription } = req.body
    
    if (feeAmount !== undefined) student.feeAmount = feeAmount
    if (feeDueDate !== undefined) student.feeDueDate = feeDueDate
    if (feeDescription !== undefined) student.feeDescription = feeDescription
    
    await student.save()
    await logAudit(req, 'UPDATE_VOUCHER', 'User', student._id, `Updated voucher details for ${student.fullName}: Rs. ${feeAmount || 'N/A'}`)
    res.json({ success: true, message: `Voucher details updated successfully.`, student })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Decline/Revoke student account access
// @route   PATCH /api/admin/students/:id/decline
// @access  Private (Admin / Director / Clerk)
exports.declineStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    student.isApproved = false
    await student.save()
    await logAudit(req, 'REVOKE_STUDENT', 'User', student._id, `Revoked admission access for ${student.fullName}`)
    res.json({ success: true, message: `Revoked ${student.fullName} access.`, student })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Approve, Suspend, or Reactivate student account
// @route   PATCH /api/admin/students/:id/status
// @access  Private (Admin / Director)
exports.updateStudentStatus = async (req, res) => {
  try {
    const { isApproved, isActive } = req.body
    const student = await User.findById(req.params.id)

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    if (typeof isApproved !== 'undefined') student.isApproved = isApproved
    if (typeof isActive !== 'undefined') student.isActive = isActive

    await student.save()

    res.json({
      success: true,
      message: `Student account updated successfully.`,
      student,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Reset student password administratively
// @route   POST /api/admin/students/:id/reset-password
// @access  Private (Admin / Director)
exports.resetStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' })
    }

    const student = await User.findById(req.params.id)
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    student.password = newPassword
    await student.save()

    res.json({
      success: true,
      message: `Password for ${student.fullName} has been updated.`,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get system-wide metrics overview
// @route   GET /api/admin/metrics
// @access  Private (Admin / Director / Clerk)
exports.getAdminMetrics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' })
    const pendingStudents = await User.countDocuments({ role: 'student', isApproved: false })
    const approvedStudents = await User.countDocuments({ role: 'student', isApproved: true })
    const totalSubmissions = await Submission.countDocuments()
    const totalLectures = await Lecture.countDocuments()
    const totalTests = await Test.countDocuments()
    const totalMCQs = await MCQ.countDocuments()

    const recentPending = await User.find({ role: 'student', isApproved: false })
      .select('fullName email grade stream createdAt')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      success: true,
      metrics: {
        totalStudents,
        pendingStudents,
        approvedStudents,
        totalSubmissions,
        totalLectures,
        totalTests,
        totalMCQs,
        recentPending,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get public statistics for homepage
// @route   GET /api/admin/public-stats
// @access  Public
exports.getPublicStats = async (req, res) => {
  try {
    const Faculty = require('../models/Faculty')
    const approvedStudents = await User.countDocuments({ role: 'student', isApproved: true })
    const totalLectures = await Lecture.countDocuments()
    const totalTests = await Test.countDocuments()
    const totalMCQs = await MCQ.countDocuments()
    const totalFaculty = await Faculty.countDocuments({ isActive: true })

    res.json({
      success: true,
      stats: {
        students: approvedStudents,
        lectures: totalLectures,
        tests: totalTests,
        mcqs: totalMCQs,
        faculty: totalFaculty,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get teacher dashboard metrics
// @route   GET /api/admin/teacher-metrics
// @access  Private (Teacher, Admin)
exports.getTeacherMetrics = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isApproved: true })
    const totalMCQs = await MCQ.countDocuments()
    const totalTests = await Test.countDocuments()
    const totalLectures = await Lecture.countDocuments()

    const recentSubmissions = await Submission.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'fullName email')
      .populate('test', 'title subject')

    res.json({
      success: true,
      metrics: {
        totalStudents,
        totalMCQs,
        totalTests,
        totalLectures,
        recentSubmissions,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get all staff accounts (teacher, clerk, admin)
// @route   GET /api/admin/staff
// @access  Private (Admin)
exports.getStaffAccounts = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['teacher', 'clerk', 'admin'] } })
      .select('-password')
      .sort({ createdAt: -1 })
    res.json({ success: true, count: staff.length, data: staff })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete a staff account (not admin)
// @route   DELETE /api/admin/staff/:id
// @access  Private (Admin)
exports.deleteStaffAccount = async (req, res) => {
  try {
    const { logAudit } = require('../middleware/auditLogger')
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff account not found' })
    }
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Super Admin accounts cannot be removed' })
    }

    const name = user.fullName
    const role = user.role
    await user.deleteOne()

    await logAudit(req, 'DELETE_STAFF_ACCOUNT', 'User', req.params.id, `Revoked ${role} account: ${name}`)

    res.json({ success: true, message: `Staff account for ${name} removed` })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Assign user a new role (e.g. make student a teacher)
// @route   PATCH /api/admin/students/:id/role
// @access  Private (Admin / Director)
exports.assignUserRole = async (req, res) => {
  try {
    const { role } = req.body
    if (!['student', 'teacher', 'clerk', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role provided' })
    }

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (user.role === 'admin' && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot demote Super Admins' })
    }

    user.role = role
    await user.save()

    res.json({
      success: true,
      message: `${user.fullName} is now a ${role}`,
      user,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

