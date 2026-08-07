require('dotenv').config({ path: './.env' });
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const parsedDocx = await mammoth.extractRawText({ path: '../PHYSICS SIR IRSHAD WITH KEY.docx' });
    let text = parsedDocx.value;
    console.log('Extracted text length:', text.length);
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log('NO API KEY');
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We will use the Google SDK Schema validation
    const { SchemaType } = require('@google/generative-ai');
    
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
    };

    const callGeminiAPI = async (apiKey, modelName, contents, schema) => {
      const isOAuth = apiKey.startsWith('AQ.') || apiKey.startsWith('ya29.');
      const url = isOAuth
        ? `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const headers = {
        'Content-Type': 'application/json'
      };
      if (isOAuth) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errText}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
      return text;
    };

    const chunk = text.substring(0, 5000);
    const prompt = `You are an expert educational AI specialized in parsing complex MDCAT, ECAT, Physics, Mathematics, and Logical Reasoning (LR) test papers. Extract all Multiple Choice Questions (MCQs) from this text chunk for subject "Physics" (Grade/Level: "XI"). 

    CRITICAL EXTRACTION RULES:
    1. IGNORE ALL HEADER/FOOTER METADATA: Strictly ignore Test Titles, Institute Names, Student Name, Father Name, Roll No, Time Limit, Marks, Signatures, and Page Numbers. Do NOT treat these as questions.
    2. IDENTIFY QUESTIONS: True questions ALWAYS start with a numbering format (e.g., "1.", "2.", "Q1", "Q.1)", etc.).
    3. PRESERVE COMPLEX FORMATS: For Physics, Maths, and LR, questions often include complex equations, symbols, or long paragraphs. Preserve them exactly. 
    4. MULTIPLE STATEMENTS (LR): If a question contains multiple Roman numeral statements (I, II, III, IV) in the body, include those statements inside the "questionText" field.
    5. EXTRACT EXACTLY 4 OPTIONS: Options may be formatted as (A, B, C, D), (a, b, c, d), or (i, ii, iii, iv). Some options might be combination statements (e.g., "A) I & III only", "B) All of these"). Ensure you extract exactly 4 distinct options. Remove the letter prefix (A, B) from the final option text.
    6. AVOID CORRUPTION: Double-check that no options are cut off, merged, or mismatched. If a question is severely corrupted, skip it.
    7. FIND CORRECT INDEX: Look for the correct answer marked in the text. The answer might be indicated as an option letter (e.g., "Ans: C", "Correct Option: A") or as the actual statement text of one of the options (e.g., "Ans: 200 Nm-1" or "Correct: 175 Hz"). Match the answer to the options you extracted and return the correct 0-based index (0 for Option A, 1 for Option B, 2 for Option C, 3 for Option D). If no answer key is found, default to 0.

    Text Chunk:
    """${chunk}"""`;
        
    console.log('Sending to Gemini...');
    const contents = [{ parts: [{ text: prompt }] }];
    const responseText = await callGeminiAPI(apiKey, 'gemini-1.5-flash', contents, mcqSchema);
    
    console.log('Raw Response Length:', responseText.length);
    const parsed = JSON.parse(responseText);
    console.log('Parsed successfully! Count:', parsed.length);
    console.log('First MCQ extracted:');
    console.log(JSON.stringify(parsed[0], null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
