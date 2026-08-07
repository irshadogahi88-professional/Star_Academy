const express = require('express')
const { getLectures, createLecture, deleteLecture, updateLecture } = require('../controllers/lectureController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.get('/', (req, res, next) => {
  // Optional auth check for getLectures
  if (req.headers.authorization) {
    return protect(req, res, () => getLectures(req, res))
  }
  getLectures(req, res)
})

router.post('/', protect, authorize('teacher', 'admin'), createLecture)
router.put('/:id', protect, authorize('teacher', 'admin'), updateLecture)
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLecture)

module.exports = router
