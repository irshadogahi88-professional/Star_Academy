import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Test } from "@/models/Test";
import { MCQ } from "@/models/MCQ";
import "@/models/Subject";
import "@/models/Chapter";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();
    const test = await Test.findById(id);
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    let mode = 'exam';
    try {
      const body = await req.json();
      mode = body.mode || 'exam';
    } catch(e) {}

    let rawMcqs: any[] = [];
    if (test.mcqIds && test.mcqIds.length > 0) {
      rawMcqs = await MCQ.find({ _id: { $in: test.mcqIds }, isActive: true });
    } else if (test.chapterId) {
      rawMcqs = await MCQ.find({ chapterId: test.chapterId, isActive: true }).sort({ order: 1 });
    } else {
      rawMcqs = [];
    }

    // Strip answers if exam mode
    const secureMcqs = rawMcqs.map((m) => {
      if (mode === 'practice') {
        return {
          _id: m._id,
          question: m.question,
          options: m.options,
          correctIndex: m.correctIndex,
          explanation: m.explanation
        };
      } else {
        return {
          _id: m._id,
          question: m.question,
          options: m.options,
        };
      }
    });

    return NextResponse.json({ test, mcqs: secureMcqs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
