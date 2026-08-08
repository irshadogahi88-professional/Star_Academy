const express = require('express')
const multer = require('multer')
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

const { generateAITest, getTests } = require('../controllers/aiTestController')
const {
  parseDocument,
  batchSaveMCQs,
  deleteSourceDocBatch,
  updateSourceDocBatch,
} = require('../controllers/docUploadController')
const {
  getMCQs,
  updateMCQ,
  deleteMCQ
} = require('../controllers/mcqController')
const { protect, authorize, optionalAuth } = require('../middleware/auth')

const router = express.Router()

// Test Endpoints
router.get('/', optionalAuth, getTests)
router.post('/generate-ai', protect, authorize('teacher', 'admin'), generateAITest)
router.post('/create-from-bank', protect, authorize('teacher', 'admin'), require('../controllers/aiTestController').createBankTest)

// MCQ Bank Endpoints
router.get('/mcqs/batches', protect, authorize('teacher', 'admin'), require('../controllers/mcqController').getMCQBatches)
router.get('/mcqs', protect, authorize('teacher', 'admin'), getMCQs)
router.put('/mcqs/:id', protect, authorize('teacher', 'admin'), updateMCQ)
router.delete('/mcqs/:id', protect, authorize('teacher', 'admin'), deleteMCQ)

// Document Parsing & Batch Management Endpoints
router.post('/parse-doc', protect, authorize('teacher', 'admin'), upload.single('file'), parseDocument)
router.post('/batch-save-mcqs', protect, authorize('teacher', 'admin'), batchSaveMCQs)
router.delete('/batch-source-doc', protect, authorize('teacher', 'admin'), deleteSourceDocBatch)
router.patch('/batch-source-doc', protect, authorize('teacher', 'admin'), updateSourceDocBatch)

router.get('/:id', optionalAuth, require('../controllers/aiTestController').getTestById)
router.put('/:id', protect, authorize('teacher', 'admin'), require('../controllers/aiTestController').updateTest)
router.delete('/:id', protect, authorize('teacher', 'admin'), require('../controllers/aiTestController').deleteTest)

module.exports = router
