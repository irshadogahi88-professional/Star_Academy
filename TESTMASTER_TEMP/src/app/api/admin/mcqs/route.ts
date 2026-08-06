import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { MCQ } from "@/models/MCQ";
import "@/models/Subject";
import "@/models/Chapter";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    const query: any = { isActive: true };
    if (subjectId) query.subjectId = subjectId;
    if (chapterId) query.chapterId = chapterId;

    await connectToDatabase();
    
    const total = await MCQ.countDocuments(query);
    const mcqs = await MCQ.find(query)
      .populate('subjectId', 'name')
      .populate('chapterId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({ 
      mcqs, 
      total, 
      page, 
      totalPages: Math.ceil(total / limit) 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching MCQs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
