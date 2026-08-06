require('dotenv').config({ path: './.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no listModels in the JS SDK? Let's just try 'gemini-1.5-flash-latest' or 'gemini-2.0-flash'
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent('hello');
    console.log('2.0 flash works:', result.response.text());
  } catch (err) {
    console.error('2.0 flash Error:', err.message);
  }
}

test();
