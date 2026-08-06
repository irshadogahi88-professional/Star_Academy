const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const MCQ = require('../models/MCQ')
const Test = require('../models/Test')

// Helper function: Sanitize text to remove headers, footers, watermarks
const sanitizeDocumentText = (text) => {
  let lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  
  // 1. Remove watermarks & common headers
  const stopWords = ['CONFIDENTIAL', 'DRAFT', 'www.', 'http://', 'https://', 'Scanned by', 'CamScanner', 'Page']
  lines = lines.filter(line => {
    const isWatermark = stopWords.some(word => line.toLowerCase().includes(word.toLowerCase()))
    const isStandaloneNumber = /^\d+$/.test(line) // e.g. standalone page numbers
    return !isWatermark && !isStandaloneNumber
  })

  // 2. Preserve paragraphs by using double newlines
  return lines.join('\n\n')
}

// Helper function: Parse raw text into structured MCQs using Gemini AI with chunking or robust Regex fallback
const extractMCQsFromText = async (rawText, subject = 'Physics', classLevel = 'XI', filename = 'Document_Import', fileBuffer = null, mimeType = null) => {
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
      const { SchemaType } = require('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      
      const mcqSchema = {
        type: SchemaType.ARRAY,
        description: "List of multiple choice questions extracted from the document",
        items: {
          type: SchemaType.OBJECT,
          properties: {
            questionText: {
              type: SchemaType.STRING,
              description: "The complete question statement. Do NOT include the question number (e.g. '1.', 'Q2'). MUST include any multi-line statements (like I, II, III) if they are part of the question."
            },
            options: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: "Exactly 4 options for the MCQ. Remove the A), B), C), D) prefixes.",
              minItems: 4,
              maxItems: 4
            },
            correctIndex: {
              type: SchemaType.INTEGER,
              description: "The 0-based index (0 to 3) of the correct option if the answer is indicated in the document. Set to 0 if unknown."
            },
            explanation: {
              type: SchemaType.STRING,
              description: "Any explanation or hint provided in the text. Empty string if none."
            }
          },
          required: ["questionText", "options", "correctIndex", "explanation"]
        }
      }

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: mcqSchema
        }
      })

      const prompt = `You are an expert educational AI specialized in parsing complex MDCAT, ECAT, Physics, Mathematics, and Logical Reasoning (LR) test papers. Extract all Multiple Choice Questions (MCQs) from this document for subject "${subject}" (Grade/Level: "${classLevel}"). 

      CRITICAL EXTRACTION RULES:
      1. IGNORE ALL HEADER/FOOTER METADATA: Strictly ignore Test Titles, Institute Names, Student Name, Father Name, Roll No, Time Limit, Marks, Signatures, and Page Numbers. Do NOT treat these as questions.
      2. IDENTIFY QUESTIONS: True questions ALWAYS start with a numbering format (e.g., "1.", "2.", "Q1", "Q.1)", etc.).
      3. PRESERVE COMPLEX FORMATS: For Physics, Maths, and LR, questions often include complex equations, symbols, or long paragraphs. Preserve them exactly. 
      4. MULTIPLE STATEMENTS (LR): If a question contains multiple Roman numeral statements (I, II, III, IV) in the body, include those statements inside the "questionText" field.
      5. EXTRACT EXACTLY 4 OPTIONS: Options may be formatted as (A, B, C, D), (a, b, c, d), or (i, ii, iii, iv). Some options might be combination statements (e.g., "A) I & III only", "B) All of these"). Ensure you extract exactly 4 distinct options. Remove the letter prefix (A, B) from the final option text.
      6. AVOID CORRUPTION: Double-check that no options are cut off, merged, or mismatched. If a question is severely corrupted, skip it.
      7. FIND ANSWER: If the answer is indicated in the text (e.g., "Ans: A", "CORRECT ANSWER: quickly", "Correct Option: C"), calculate "correctIndex" (0=A, 1=B, 2=C, 3=D). Otherwise, set correctIndex to 0.`;

      // Try native PDF parsing first if it is a PDF
      const isPdf = fileBuffer && (filename.toLowerCase().endsWith('.pdf') || (mimeType && mimeType.toLowerCase().includes('pdf')));
      if (isPdf) {
        try {
          console.log('Using native Gemini PDF document parsing...');
          const filePart = {
            inlineData: {
              data: fileBuffer.toString('base64'),
              mimeType: 'application/pdf'
            }
          };

          const result = await model.generateContent([filePart, prompt]);
          const responseText = result.response.text();
          
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            const parsedArray = JSON.parse(jsonMatch[0]);
            if (Array.isArray(parsedArray)) {
              allMcqs = parsedArray.map(mcq => ({
                ...mcq,
                subject,
                class: classLevel,
                chapter: 'Imported Chapter',
                difficulty: 'Medium',
                sourceDoc: filename
              }));
            }
          }
        } catch (pdfErr) {
          console.warn('Native Gemini PDF parsing failed, falling back to text chunking:', pdfErr.message);
        }
      }

      // If not a PDF or native PDF parsing failed/returned no MCQs, use text chunks with Gemini
      if (allMcqs.length === 0) {
        console.log('Using Gemini text chunk parsing...');
        for (const chunk of chunks) {
          const chunkPrompt = prompt + `\n\nText Chunk:\n"""${chunk}"""`;
          const result = await model.generateContent(chunkPrompt)
          const responseText = result.response.text();
          
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              const parsedArray = JSON.parse(jsonMatch[0]);
              if (Array.isArray(parsedArray)) {
                allMcqs = allMcqs.concat(parsedArray.map(mcq => ({
                  ...mcq,
                  subject,
                  class: classLevel,
                  chapter: 'Imported Chapter',
                  difficulty: 'Medium',
                  sourceDoc: filename
                })));
              }
            } catch (parseErr) {
              console.warn('Failed to parse chunk JSON:', parseErr.message);
            }
          }
        }
      }
      
      if (allMcqs.length > 0) {
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

  // Regex Fallback Parser for structured text (Improved to handle unnumbered docs)
  const blocks = sanitizedText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)

  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]

    // Determine if this block is a numbered question e.g., "1. What is..." or "Q1) What is..."
    const isNumberedQuestion = /^(?:Q\d+|\d+)[\.\)]\s*/i.test(block)
    
    // Scenario 1: Numbered question block containing options inline
    if (isNumberedQuestion && block.match(/([a-d])[\.\)]/i)) {
      const optionsMatch = block.match(/([a-d])[\.\)]\s*(.*?)(?=(?:[a-d][\.\)]|$))/gi)
      const qTextMatch = block.split(/(?=[a-d][\.\)])/i)[0]
      let qTextLine = qTextMatch ? qTextMatch.replace(/^(?:Q\d+|\d+)[\.\)]\s*/i, '').trim() : ''
      
      const options = []
      if (optionsMatch) {
        optionsMatch.forEach(optStr => {
          const cleaned = optStr.replace(/^[a-d][\.\)]\s*/i, '').trim()
          if (cleaned) options.push(cleaned)
        })
      }
      
      if (options.length > 1) {
        while (options.length < 4) options.push('Option ' + String.fromCharCode(65 + options.length))
        allMcqs.push({
          questionText: qTextLine || block,
          options: options.slice(0, 4),
          correctIndex: 0,
          explanation: `Parsed from document ${filename}`,
          subject, class: classLevel, chapter: 'Imported Chapter', difficulty: 'Medium', sourceDoc: filename
        })
      }
      i++
      continue
    }

    // Scenario 2: Unnumbered (or numbered) question followed by 4 separate option blocks
    let j = i + 1
    const potentialOptions = []
    
    while (j < blocks.length && j < i + 5) {
      // Clean option prefix if it exists like "A) "
      const cleanedOpt = blocks[j].replace(/^[a-d][\.\)]\s*/i, '').trim()
      potentialOptions.push(cleanedOpt)
      j++
    }
    
    if (potentialOptions.length === 4) {
      // Looks like a valid 4-option unnumbered question format
      const qTextLine = block.replace(/^(?:Q\d+|\d+)[\.\)]\s*/i, '').trim()
      allMcqs.push({
        questionText: qTextLine,
        options: potentialOptions,
        correctIndex: 0,
        explanation: `Parsed from document ${filename}`,
        subject, class: classLevel, chapter: 'Imported Chapter', difficulty: 'Medium', sourceDoc: filename
      })
      i = j // Skip over the options
    } else {
      // Not 4 options, just move forward
      i++
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
      req.file ? req.file.originalname : filename,
      req.file ? req.file.buffer : null,
      req.file ? req.file.mimetype : null
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
