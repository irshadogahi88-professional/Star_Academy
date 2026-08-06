const express = require('express')
const router = express.Router()
const { getGalleryImages, getAllGalleryImages, createGalleryImage, updateGalleryImage, deleteGalleryImage } = require('../controllers/galleryController')
const { protect, authorize } = require('../middleware/auth')

// Public routes
router.get('/', getGalleryImages)

// Admin routes
router.get('/all', protect, authorize('admin'), getAllGalleryImages)
router.post('/', protect, authorize('admin'), createGalleryImage)
router.patch('/:id', protect, authorize('admin'), updateGalleryImage)
router.delete('/:id', protect, authorize('admin'), deleteGalleryImage)

module.exports = router
