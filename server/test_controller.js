const fs = require('fs');
const mammoth = require('mammoth');
const controller = require('./controllers/docUploadController');

// The functions inside docUploadController are not exported individually, 
// so we'll just copy the relevant part to test.
const sanitizeDocumentText = (text) => {
  let lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const stopWords = ['CONFIDENTIAL', 'DRAFT', 'www.', 'http://', 'https://', 'Scanned by', 'CamScanner', 'Page']
  lines = lines.filter(line => {
    const isWatermark = stopWords.some(word => line.toLowerCase().includes(word.toLowerCase()))
    const isStandaloneNumber = /^\d+$/.test(line) 
    return !isWatermark && !isStandaloneNumber
  })
  return lines.join('\n\n')
}

const extract = (rawText) => {
  const sanitizedText = sanitizeDocumentText(rawText)
  const allMcqs = []
  
  const blocks = sanitizedText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)

  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]

    const isNumberedQuestion = /^(?:Q\d+|\d+)[\.\)]\s*/i.test(block)
    
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
          options: options.slice(0, 4)
        })
      }
      i++
      continue
    }

    let j = i + 1
    const potentialOptions = []
    
    while (j < blocks.length && j < i + 5) {
      const cleanedOpt = blocks[j].replace(/^[a-d][\.\)]\s*/i, '').trim()
      potentialOptions.push(cleanedOpt)
      j++
    }
    
    if (potentialOptions.length === 4) {
      const qTextLine = block.replace(/^(?:Q\d+|\d+)[\.\)]\s*/i, '').trim()
      allMcqs.push({
        questionText: qTextLine,
        options: potentialOptions
      })
      i = j 
    } else {
      i++
    }
  }
  return allMcqs;
}

async function run() {
  const parsedDocx = await mammoth.extractRawText({ path: '../PHYSICS SIR IRSHAD.docx' });
  const mcqs = extract(parsedDocx.value);
  console.log('Extracted count:', mcqs.length);
  if (mcqs.length > 0) {
    console.log('First MCQ:', mcqs[0]);
    console.log('Last MCQ:', mcqs[mcqs.length - 1]);
  }
}

run();
