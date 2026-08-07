const mongoose = require('mongoose')

const MCQSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
    explanation: { type: String, default: '' },
    subject: {
      type: String,
      required: true,
      enum: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'LR', 'Logical Reasoning', 'All', 'General', 'Computer Science', 'MDCAT Mock', 'ECAT Mock'],
    },
    chapter: { type: String, default: 'General' },
    class: {
      type: String,
      required: true,
      enum: ['9', '10', '11', '12', 'MDCAT', 'ECAT'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'MDCAT Level'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['pending_review', 'published', 'archived'],
      default: 'published',
    },
    sourceDoc: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

// Performance indexes
MCQSchema.index({ subject: 1, class: 1 })
MCQSchema.index({ sourceDoc: 1 })
MCQSchema.index({ status: 1 })
MCQSchema.index({ createdAt: -1 })

module.exports = mongoose.model('MCQ', MCQSchema)
