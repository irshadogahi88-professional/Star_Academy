const MCQ = require('../models/MCQ')

// @desc    Get paginated MCQs for Bank
// @route   GET /api/tests/mcqs
// @access  Private (Teacher, Admin)
exports.getMCQs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 50
    const startIndex = (page - 1) * limit

    let query = {}
    
    // Filters
    if (req.query.subject) query.subject = req.query.subject
    if (req.query.classLevel) query.class = req.query.classLevel
    if (req.query.chapter) query.chapter = req.query.chapter
    if (req.query.difficulty) query.difficulty = req.query.difficulty
    if (req.query.search) {
      query.questionText = { $regex: req.query.search, $options: 'i' }
    }

    const total = await MCQ.countDocuments(query)
    const mcqs = await MCQ.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)

    // Pagination result
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }

    res.status(200).json({
      success: true,
      count: mcqs.length,
      pagination,
      data: mcqs,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get MCQ Batches grouped by sourceDoc
// @route   GET /api/tests/mcqs/batches
// @access  Private (Teacher, Admin)
exports.getMCQBatches = async (req, res) => {
  try {
    const batches = await MCQ.aggregate([
      {
        $group: {
          _id: { sourceDoc: "$sourceDoc", subject: "$subject" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          sourceDoc: { $ifNull: ["$_id.sourceDoc", "Manual Input"] },
          subject: "$_id.subject",
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
    res.status(200).json({ success: true, data: batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// @desc    Update single MCQ
// @route   PUT /api/tests/mcqs/:id
// @access  Private (Teacher, Admin)
exports.updateMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true
    })
    
    if (!mcq) {
      return res.status(404).json({ success: false, message: 'MCQ not found' })
    }
    
    res.status(200).json({ success: true, data: mcq })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete single MCQ
// @route   DELETE /api/tests/mcqs/:id
// @access  Private (Teacher, Admin)
exports.deleteMCQ = async (req, res) => {
  try {
    const mcq = await MCQ.findByIdAndDelete(req.params.id)
    
    if (!mcq) {
      return res.status(404).json({ success: false, message: 'MCQ not found' })
    }
    
    res.status(200).json({ success: true, message: 'MCQ deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
