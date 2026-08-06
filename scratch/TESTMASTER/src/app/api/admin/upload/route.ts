import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const arrayBuffer = await req.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: "No file data provided" }, { status: 400 });
    }

    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = req.headers.get("content-type") || "application/pdf";

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `You are an expert educational content extractor. Extract all Multiple Choice Questions (MCQs) from the provided document.
Return the result STRICTLY as a JSON array of objects with the following exact keys:
- question: (string) The question text.
- options: (array of strings) The available choices. Do not include the letter prefix (A, B, C) in the option string if possible.
- correctIndex: (number) The 0-based index of the correct option in the options array. If the answer is not provided, set to 0.
- explanation: (string) Any explanation provided in the text. If none, use an empty string.

IMPORTANT: Your response must be ONLY valid JSON, starting with '[' and ending with ']'. Do not include markdown code blocks (\`\`\`json).`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "application/pdf",
        },
      },
      prompt,
    ]);

    const responseText = result.response.text();
    
    // Robust Regex to extract JSON block even if Gemini includes conversational text
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON array from AI response");
    }
    
    const parsedMCQs = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ mcqs: parsedMCQs }, { status: 200 });

  } catch (error: any) {
    console.error("Error parsing document:", error);
    return NextResponse.json({ error: error.message || "Failed to parse document" }, { status: 500 });
  }
}
