import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Test } from "@/models/Test";
import { MCQ } from "@/models/MCQ";
import "@/models/Subject";
import "@/models/Chapter";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    // get test 6a6b335774f168254cd0b394
    const test = await Test.findById("6a6b335774f168254cd0b394");
    if (!test) return NextResponse.json({ error: "No test" });

    let rawMcqs;
    if (test.mcqIds && test.mcqIds.length > 0) {
      rawMcqs = await MCQ.find({ _id: { $in: test.mcqIds }, isActive: true });
    } else if (test.chapterId) {
      rawMcqs = await MCQ.find({ chapterId: test.chapterId, isActive: true }).sort({ order: 1 });
    } else {
      rawMcqs = [];
    }

    return NextResponse.json({ 
      test, 
      mcqsLength: rawMcqs.length,
      chapterId: test.chapterId,
      mcqIds: test.mcqIds
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
