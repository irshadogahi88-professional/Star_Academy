import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { MCQ } from "@/models/MCQ";
import "@/models/Subject";
import "@/models/Chapter";

export async function GET(req: Request) {
  try {
    // API is public now


    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 3) {
      return NextResponse.json({ mcqs: [] }, { status: 200 });
    }

    await connectToDatabase();
    
    // Search question text with case-insensitive regex
    const mcqs = await MCQ.find({ 
      isActive: true, 
      question: { $regex: query, $options: "i" } 
    })
    .populate('subjectId', 'name')
    .populate('chapterId', 'name')
    .limit(20)
    .lean();

    return NextResponse.json({ mcqs }, { status: 200 });
  } catch (error: any) {
    console.error("Error searching MCQs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
