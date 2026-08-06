require('dotenv').config({ path: './.env' });
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const parsedDocx = await mammoth.extractRawText({ path: '../PHYSICS SIR IRSHAD.docx' });
    let text = parsedDocx.value;
    console.log('Extracted text length:', text.length);
    console.log('First 500 chars:\n', text.substring(0, 500));
    
    // Attempt Gemini extraction
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('NO API KEY');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const chunk = text.substring(0, 5000);
    const prompt = `You are an expert MCQ extraction system. Extract all Multiple Choice Questions (MCQs) from the following text chunk for subject "Physics" (Grade/Level: "XI"). 
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
            "subject": "Physics",
            "class": "XI",
            "chapter": "Chapter Heading",
            "difficulty": "Medium",
            "sourceDoc": "doc"
          }
        ]`;
        
    console.log('Sending to Gemini...');
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    console.log('Raw Response:\n', responseText);
    
    const cleanedText = responseText.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
    console.log('Cleaned Response:\n', cleanedText);
    const parsed = JSON.parse(cleanedText);
    console.log('Parsed successfully! Count:', parsed.length);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
