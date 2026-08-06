const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const MCQ = require('../models/MCQ')
const Test = require('../models/Test')

// Helper function: Sanitize text to remove headers, footers, watermarks, and normalize columns
const sanitizeDocumentText = (text) => {
  let lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  // 1. Remove watermarks & common headers
  const stopWords = ['CONFIDENTIAL', 'DRAFT', 'www.', 'http://', 'https://', 'Scanned by', 'CamScanner', 'Page']
  lines = lines.filter(line => {
    const isWatermark = stopWords.some(word => line.toLowerCase().includes(word.toLowerCase()))
    const isStandaloneNumber = /^\d+$/.test(line) // e.g. standalone page numbers
    return !isWatermark && !isStandaloneNumber
  })

  // 2. Normalize multi-column merging (heuristic: join short adjacent lines that don't look like new questions/options)
  let normalizedText = ''
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isQuestionStart = /^\d+[\.\)]/.test(line) || /^Q\d+/.test(line) || /^[A-D][\.\)]/.test(line) || /^[a-d][\.\)]/.test(line)
    
    if (isQuestionStart) {
      normalizedText += '\n\n' + line + ' '
    } else {
      normalizedText += line + ' '
    }
  }

  return normalizedText.trim()
}

// Helper function: Parse raw text into structured MCQs using Gemini AI with chunking or robust Regex fallback
const extractMCQsFromText = async (rawText, subject = 'Physics', classLevel = 'XI', filename = 'Document_Import') => {
  const apiKey = process.env.GEMINI_API_KEY
  const sanitizedText = sanitizeDocumentText(rawText)
  
  let allMcqs = []

  // Feature: Large File Chunking
  // Gemini 1.5 Flash has a large context, but chunking prevents output truncation on massive lists
  const chunkSize = 40000 
  const chunks = []
  for (let i = 0; i < sanitizedText.length; i += chunkSize) {
    chunks.push(sanitizedText.slice(i, i + chunkSize))
  }

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

      for (const chunk of chunks) {
        const prompt = `You are an expert MCQ extraction system. Extract all Multiple Choice Questions (MCQs) from the following text chunk for subject "${subject}" (Grade/Level: "${classLevel}"). 
        RULES:
        - IGNORE all page headers, footers, watermarks, page numbers, and document titles.
        - IGNORE any decorative text or column separators.
        - Each MCQ MUST have exactly 4 distinct options. If a question is corrupted or merged from column overflow, skip it.
        - Assign an accurate "chapter" name based on the nearest heading in the text, do NOT just output "General".
        - If the answer is indicated in the text (e.g. "Ans: A"), calculate the correctIndex (0 for A, 1 for B, 2 for C, 3 for D). Otherwise, set correctIndex to 0.
        
        Text Chunk:
        """${chunk}"""

        Return ONLY a valid JSON array of question objects matching this structure (no markdown code fences, no extra text):
        [
          {
            "questionText": "Full question statement",
            "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
            "correctIndex": 0,
            "explanation": "Brief explanation if present",
            "subject": "${subject}",
            "class": "${classLevel}",
            "chapter": "Chapter Heading",
            "difficulty": "Medium",
            "sourceDoc": "${filename}"
          }
        ]`

        const result = await model.generateContent(prompt)
        const responseText = result.response.text().trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim()
        
        try {
          const parsedArray = JSON.parse(responseText)
          if (Array.isArray(parsedArray)) {
            allMcqs = allMcqs.concat(parsedArray)
          }
        } catch (parseErr) {
          console.warn('Failed to parse chunk JSON, skipping chunk.')
        }
      }
      
      if (allMcqs.length > 0) {
        // Deduplicate by question text
        const uniqueMcqs = []
        const seen = new Set()
        for (const mcq of allMcqs) {
          const normQ = mcq.questionText.toLowerCase().replace(/\s+/g, '')
          if (!seen.has(normQ)) {
            seen.add(normQ)
            uniqueMcqs.push(mcq)
          }
        }
        return uniqueMcqs
      }

    } catch (aiErr) {
      console.warn('Gemini AI parsing fallback to regex:', aiErr.message)
    }
  }

  // Regex Fallback Parser for structured text (Improved)
  const questionBlocks = sanitizedText.split(/(?=\bQ\d+[\.\)]|\b\d+[\.\)]\s+)/gi)

  for (const block of questionBlocks) {
    if (!block.trim()) continue

    // Attempt to split options by A) B) C) D) or (a) (b) (c) (d)
    const optionsMatch = block.match(/([a-d])[\.\)]\s*(.*?)(?=(?:[a-d][\.\)]|$))/gi)
    const qTextMatch = block.split(/(?=[a-d][\.\)])/i)[0]

    let qTextLine = qTextMatch ? qTextMatch.replace(/^(?:Q\d+|\d+)[\.\)]\s*/i, '').trim() : ''
    if (!qTextLine) continue

    const options = []
    let correctIndex = 0

    if (optionsMatch) {
      optionsMatch.forEach((optStr, idx) => {
        const cleaned = optStr.replace(/^[a-d][\.\)]\s*/i, '').trim()
        if (cleaned) options.push(cleaned)
      })
    }

    // Look for Answer marker
    const ansMatch = block.match(/(?:Ans|Answer|Key|Correct)\s*[:=\-]?\s*([a-d])/i)
    if (ansMatch) {
      const letter = ansMatch[1].toLowerCase()
      if (letter === 'b') correctIndex = 1
      else if (letter === 'c') correctIndex = 2
      else if (letter === 'd') correctIndex = 3
    }

    if (options.length > 1) {
      // Ensure exactly 4 options by padding or trimming
      while (options.length < 4) options.push('Option ' + String.fromCharCode(65 + options.length))
      const finalOptions = options.slice(0, 4)

      allMcqs.push({
        questionText: qTextLine,
        options: finalOptions,
        correctIndex: correctIndex,
        explanation: `Parsed from document ${filename}`,
        subject: subject,
        class: classLevel,
        chapter: 'Imported Chapter',
        difficulty: 'Medium',
        sourceDoc: filename,
      })
    }
  }

  if (allMcqs.length === 0) {
    allMcqs.push({
      questionText: `Extracted Question 1 from ${filename}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: 0,
      explanation: 'Default extracted option',
      subject: subject,
      class: classLevel,
      chapter: 'Imported',
      difficulty: 'Medium',
      sourceDoc: filename,
    })
  }

  return allMcqs
}

// @desc    Parse PDF or Word Document into MCQs for Review
// @route   POST /api/tests/parse-doc
// @access  Private (Teacher, Admin)
exports.parseDocument = async (req, res) => {
  try {
    const { rawText, filename = 'Uploaded_Paper.pdf', subject = 'Physics', classLevel = 'XI' } = req.body
    let extractedText = rawText || ''

    if (req.file) {
      const fileBuffer = req.file.buffer
      const mimeType = req.file.mimetype

      if (mimeType.includes('pdf') || req.file.originalname.endsWith('.pdf')) {
        const parsedPdf = await pdfParse(fileBuffer)
        extractedText = parsedPdf.text
      } else if (
        mimeType.includes('word') ||
        mimeType.includes('officedocument') ||
        req.file.originalname.endsWith('.docx')
      ) {
        const parsedDocx = await mammoth.extractRawText({ buffer: fileBuffer })
        extractedText = parsedDocx.value
      }
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'No readable text content found in uploaded document. Please check the file.',
      })
    }

    const mcqs = await extractMCQsFromText(
      extractedText,
      subject,
      classLevel,
      req.file ? req.file.originalname : filename
    )

    res.status(200).json({
      success: true,
      filename: req.file ? req.file.originalname : filename,
      count: mcqs.length,
      mcqs: mcqs,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: `Document Parsing Error: ${error.message}` })
  }
}

// @desc    Batch Save Reviewed MCQs into MCQ Bank
// @route   POST /api/tests/batch-save-mcqs
// @access  Private (Teacher, Admin)
exports.batchSaveMCQs = async (req, res) => {
  try {
    const { mcqs } = req.body

    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid MCQs provided for batch save.' })
    }

    const classMap = {
      'IX': '9', 'ix': '9', '9th': '9',
      'X': '10', 'x': '10', '10th': '10',
      'XI': '11', 'xi': '11', '11th': '11',
      'XII': '12', 'xii': '12', '12th': '12',
    }

    const formatted = mcqs.map((q) => {
      let mappedClass = q.class || '11'
      if (classMap[mappedClass]) {
        mappedClass = classMap[mappedClass]
      }
      return {
        questionText: q.questionText,
        options: q.options || ['A', 'B', 'C', 'D'],
        correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
        explanation: q.explanation || '',
        subject: q.subject || 'Physics',
        class: mappedClass,
        chapter: q.chapter || 'General',
        difficulty: q.difficulty || 'Medium',
        sourceDoc: q.sourceDoc || 'Imported File',
        createdBy: req.user ? req.user.id : null,
      }
    })

    const savedMCQs = await MCQ.insertMany(formatted)

    res.status(201).json({
      success: true,
      count: savedMCQs.length,
      message: `Successfully saved ${savedMCQs.length} MCQs to MCQ Bank!`,
      data: savedMCQs,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Delete entire batch of MCQs imported from a specific source file
// @route   DELETE /api/tests/batch-source-doc
// @access  Private (Teacher, Admin)
exports.deleteSourceDocBatch = async (req, res) => {
  try {
    const { sourceDoc } = req.query
    if (!sourceDoc) {
      return res.status(400).json({ success: false, message: 'sourceDoc parameter is required' })
    }

    const result = await MCQ.deleteMany({ sourceDoc: sourceDoc })
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} MCQs imported from "${sourceDoc}"`,
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @desc    Update subject or chapter for entire batch of MCQs from a source file
// @route   PATCH /api/tests/batch-source-doc
// @access  Private (Teacher, Admin)
exports.updateSourceDocBatch = async (req, res) => {
  try {
    const { sourceDoc, newSubject, newClass, newChapter } = req.body
    if (!sourceDoc) {
      return res.status(400).json({ success: false, message: 'sourceDoc is required' })
    }

    const updateFields = {}
    if (newSubject) updateFields.subject = newSubject
    if (newClass) updateFields.class = newClass
    if (newChapter) updateFields.chapter = newChapter

    const result = await MCQ.updateMany({ sourceDoc: sourceDoc }, { $set: updateFields })
    res.status(200).json({
      success: true,
      message: `Updated ${result.modifiedCount} MCQs from "${sourceDoc}"`,
      modifiedCount: result.modifiedCount,
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
