const { GoogleGenerativeAI } = require('@google/generative-ai')
const Test = require('../models/Test')
const MCQ = require('../models/MCQ')
const { logAudit } = require('../middleware/auditLogger')

// @desc    Generate MCQ Test using Gemini AI from topic or raw text
// @route   POST /api/tests/generate-ai
// @access  Private (Teacher, Admin)
exports.generateAITest = async (req, res) => {
  try {
    const { topic, subject, grade, numQuestions = 10, contentText } = req.body

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Fallback generator if API key is not yet set in .env
      const mockQuestions = Array.from({ length: numQuestions }, (_, i) => ({
        questionText: `Sample AI Question ${i + 1} regarding ${topic || subject || 'Physics'}?`,
        options: [
          `Option A for Q${i + 1}`,
          `Option B for Q${i + 1}`,
          `Option C for Q${i + 1}`,
          `Option D for Q${i + 1}`,
        ],
        correctOptionIndex: 0,
        explanation: `Explanation for sample AI question ${i + 1}.`,
        subject: subject || 'Physics',
      }))

      const newTest = await Test.create({
        title: `AI Generated Test: ${topic || subject}`,
        description: `Automated test generated for Grade ${grade || 'XI'} on ${topic || subject}.`,
        subject: subject || 'Physics',
        grade: grade || '11',
        durationMinutes: 20,
        totalMarks: numQuestions * 5,
        questions: mockQuestions,
        createdBy: req.user ? req.user.id : null,
        isAIGenerated: true,
      })

      return res.status(201).json({
        success: true,
        message: 'AI Test generated successfully (Fallback mode — add GEMINI_API_KEY to .env for live Gemini output)',
        data: newTest,
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are an expert examiner for Star Educational Academy, Ghotki. 
    Create a ${numQuestions}-question Multiple Choice Question (MCQ) test for subject: ${subject || 'Physics'}, Grade: ${grade || '11'}, Topic: "${topic || 'General Science'}".
    ${contentText ? `Use the following study text as source content:\n"""${contentText}"""\n` : ''}

    Return ONLY a valid JSON object matching this structure (no markdown fences, no formatting backticks):
    {
      "title": "${topic || subject} Practice Test",
      "description": "AI-generated quiz based on ${topic || subject}",
      "questions": [
        {
          "questionText": "Question string here...",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctOptionIndex": 0,
          "explanation": "Brief solution explanation..."
        }
      ]
    }`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim().replace(/^```json/, '').replace(/```$/, '').trim()
    const parsedData = JSON.parse(responseText)

    const newTest = await Test.create({
      title: parsedData.title || `AI Test: ${topic}`,
      description: parsedData.description || 'AI-generated test',
      subject: subject || 'Physics',
      grade: grade || '11',
      durationMinutes: numQuestions * 2,
      totalMarks: numQuestions * 5,
      questions: parsedData.questions,
      createdBy: req.user ? req.user.id : null,
      isAIGenerated: true,
      startTime: req.body.startTime || null,
      endTime: req.body.endTime || null,
      showResultsToStudents: req.body.showResultsToStudents !== undefined ? req.body.showResultsToStudents : true,
    })

    await logAudit(req, 'GENERATE_AI_TEST', 'Test', newTest._id, `Generated AI test: ${newTest.title}`)

    res.status(201).json({
      success: true,
      data: newTest,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: `AI Generation Error: ${error.message}` })
  }
}

// @desc    Get all tests
// @route   GET /api/tests
// @access  Private / Public preview
exports.getTests = async (req, res) => {
  try {
    const { subject, grade } = req.query
    let query = { isPublished: true }
    if (subject) query.subject = subject
    if (grade) query.grade = grade

    // Filter for students: hide expired or future tests
    if (req.user && req.user.role === 'student') {
      const now = new Date()
      query.$and = [
        { $or: [{ startTime: null }, { startTime: { $lte: now } }] },
        { $or: [{ endTime: null }, { endTime: { $gte: now } }] }
      ]
    }

    const tests = await Test.find(query).sort('-createdAt')
    res.status(200).json({ success: true, count: tests.length, data: tests })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Get single test by ID (redacts answers for students)
// @route   GET /api/tests/:id
// @access  Public (Optional Auth)
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }

    const testObj = test.toObject()

    // Redact answers if user is a student or unauthenticated (unless attempting in practice mode)
    const isPracticeReq = testObj.mode === 'practice' || req.query.mode === 'practice'
    if ((!req.user || req.user.role === 'student') && !isPracticeReq) {
      testObj.questions = testObj.questions.map(q => {
        const qObj = { ...q }
        delete qObj.correctOptionIndex
        delete qObj.explanation
        return qObj
      })
    }

    res.status(200).json({ success: true, data: testObj })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}



// @desc    Create Test from MCQ Bank (Manual Selection or Random Auto-Sample)
// @route   POST /api/tests/create-from-bank
// @access  Private (Teacher, Admin)
exports.createBankTest = async (req, res) => {
  try {
    const { title, subject, grade, mode, durationMinutes, totalMarks, mcqIds, randomCount, examMode, startTime, endTime, showResultsToStudents } = req.body

    let selectedMCQs = []

    if (mode === 'manual' && mcqIds && mcqIds.length > 0) {
      selectedMCQs = await MCQ.find({ _id: { $in: mcqIds } })
    } else if (mode === 'random') {
      const matchQuery = {}
      if (subject) matchQuery.subject = subject
      if (grade) {
        const classMap = {
          'IX': '9', 'ix': '9', '9th': '9',
          'X': '10', 'x': '10', '10th': '10',
          'XI': '11', 'xi': '11', '11th': '11',
          'XII': '12', 'xii': '12', '12th': '12',
        }
        matchQuery.class = classMap[grade] || grade
      }

      selectedMCQs = await MCQ.aggregate([
        { $match: matchQuery },
        { $sample: { size: randomCount || 20 } }
      ])
    }

    if (!selectedMCQs || selectedMCQs.length === 0) {
      return res.status(400).json({ success: false, message: 'No MCQs found for this test configuration.' })
    }

    // Format for Test Schema
    const formattedQuestions = selectedMCQs.map(q => ({
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctIndex,
      explanation: q.explanation || '',
      subject: q.subject
    }))

    const computedPassingMarks = req.body.passingMarks !== undefined 
      ? req.body.passingMarks 
      : (req.body.passingScore !== undefined 
          ? Math.round((totalMarks || formattedQuestions.length) * (req.body.passingScore / 100)) 
          : Math.round((totalMarks || formattedQuestions.length) * 0.4))

    // Map frontend examMode ('timed' | 'practice') to database mode ('test' | 'practice')
    const dbMode = examMode === 'practice' ? 'practice' : 'test'

    // Map Roman grades to standard numbers to match TestSchema enum
    const classMap = {
      'IX': '9', 'ix': '9', '9th': '9',
      'X': '10', 'x': '10', '10th': '10',
      'XI': '11', 'xi': '11', '11th': '11',
      'XII': '12', 'xii': '12', '12th': '12',
    }
    const dbGrade = classMap[grade] || grade || '11'

    const newTest = await Test.create({
      title: title || 'New Examination',
      description: `Generated via ${mode} selection from MCQ Bank.`,
      subject: subject || 'Physics',
      grade: dbGrade,
      mode: dbMode,
      durationMinutes: durationMinutes || 30,
      totalMarks: totalMarks || formattedQuestions.length,
      passingMarks: computedPassingMarks,
      questions: formattedQuestions,
      mcqRefs: selectedMCQs.map(q => q._id),
      createdBy: req.user ? req.user.id : null,
      isAIGenerated: false,
      startTime: startTime || null,
      endTime: endTime || null,
      showResultsToStudents: showResultsToStudents !== undefined ? showResultsToStudents : true,
      allowPracticeMode: req.body.allowPracticeMode !== undefined ? req.body.allowPracticeMode : true,
      showAnswersAtEnd: req.body.showAnswersAtEnd !== undefined ? req.body.showAnswersAtEnd : true,
    })

    await logAudit(req, 'CREATE_BANK_TEST', 'Test', newTest._id, `Created test from MCQ bank: ${newTest.title}`)

    res.status(201).json({
      success: true,
      message: 'Test created successfully from MCQ Bank!',
      data: newTest
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update Test Metadata
// @route   PUT /api/tests/:id
// @access  Private (Teacher, Admin)
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }
    
    // Only allow creator or admin to update
    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this test' })
    }

    const { title, durationMinutes, startTime, endTime, showResultsToStudents, subject, grade, mode, examMode, questions, allowPracticeMode, showAnswersAtEnd, passingMarks, passingScore, totalMarks } = req.body

    if (title !== undefined) test.title = title
    if (durationMinutes !== undefined) test.durationMinutes = durationMinutes
    if (startTime !== undefined) test.startTime = startTime
    if (endTime !== undefined) test.endTime = endTime
    if (showResultsToStudents !== undefined) test.showResultsToStudents = showResultsToStudents
    if (subject !== undefined) test.subject = subject
    
    if (grade !== undefined) {
      const classMap = {
        'IX': '9', 'ix': '9', '9th': '9',
        'X': '10', 'x': '10', '10th': '10',
        'XI': '11', 'xi': '11', '11th': '11',
        'XII': '12', 'xii': '12', '12th': '12',
      }
      test.grade = classMap[grade] || grade
    }

    if (mode !== undefined) {
      test.mode = mode === 'timed' ? 'test' : mode
    } else if (examMode !== undefined) {
      test.mode = examMode === 'timed' ? 'test' : (examMode === 'practice' ? 'practice' : 'test')
    }

    if (allowPracticeMode !== undefined) test.allowPracticeMode = allowPracticeMode
    if (showAnswersAtEnd !== undefined) test.showAnswersAtEnd = showAnswersAtEnd
    
    if (questions !== undefined && Array.isArray(questions)) {
      test.questions = questions
      test.totalMarks = totalMarks !== undefined ? totalMarks : questions.length
    } else if (totalMarks !== undefined) {
      test.totalMarks = totalMarks
    }

    if (passingMarks !== undefined) {
      test.passingMarks = passingMarks
    } else if (passingScore !== undefined) {
      test.passingMarks = Math.round(test.totalMarks * (passingScore / 100))
    }

    await test.save()
    
    await logAudit(req, 'UPDATE_TEST', 'Test', test._id, `Updated test: ${test.title}`)

    res.json({ success: true, message: 'Test updated successfully', data: test })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete Test
// @route   DELETE /api/tests/:id
// @access  Private (Teacher, Admin)
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' })
    }
    
    if (test.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this test' })
    }

    await Test.deleteOne({ _id: req.params.id })
    // Note: In a real system, you'd also delete Submissions associated with this test
    
    await logAudit(req, 'DELETE_TEST', 'Test', req.params.id, `Deleted test: ${test.title}`)

    res.json({ success: true, message: 'Test deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
