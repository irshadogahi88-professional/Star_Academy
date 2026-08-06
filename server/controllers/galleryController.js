const Gallery = require('../models/Gallery')
const cache = require('../utils/cache')

// @desc    Get all active gallery images (Public)
// @route   GET /api/gallery
// @access  Public
exports.getGalleryImages = async (req, res) => {
  try {
    const cachedData = cache.getCache('gallery_active')
    if (cachedData) {
      return res.status(200).json({ success: true, count: cachedData.length, data: cachedData })
    }

    const images = await Gallery.find({ isActive: true }).sort('order createdAt')
    cache.setCache('gallery_active', images, 900) // 15 mins
    res.status(200).json({ success: true, count: images.length, data: images })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Get all gallery images including inactive (Admin)
// @route   GET /api/gallery/all
// @access  Private/Admin
exports.getAllGalleryImages = async (req, res) => {
  try {
    const images = await Gallery.find({}).sort('order createdAt')
    res.status(200).json({ success: true, count: images.length, data: images })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Create a new gallery image
// @route   POST /api/gallery
// @access  Private/Admin
exports.createGalleryImage = async (req, res) => {
  try {
    // If order not provided, put it at the end
    if (!req.body.order) {
      const count = await Gallery.countDocuments({})
      req.body.order = count + 1
    }

    const image = await Gallery.create(req.body)

    cache.invalidateCache('gallery_active')

    res.status(201).json({ success: true, data: image })
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message)
      return res.status(400).json({ success: false, message: messages.join(', ') })
    }
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Update a gallery image
// @route   PATCH /api/gallery/:id
// @access  Private/Admin
exports.updateGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    })

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' })
    }

    cache.invalidateCache('gallery_active')

    res.status(200).json({ success: true, data: image })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
exports.deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id)

    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' })
    }

    const title = image.title
    await image.deleteOne()

    cache.invalidateCache('gallery_active')

    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' })
  }
}
