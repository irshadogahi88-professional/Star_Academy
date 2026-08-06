import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Test } from "@/models/Test";
import { MCQ } from "@/models/MCQ";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, subjectId, chapterId, count } = await req.json();

    if (!title || !subjectId || !count) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const query: any = { subjectId, isActive: true };
    if (chapterId) query.chapterId = chapterId;

    // Fetch all matching MCQs
    const mcqs = await MCQ.find(query).select('_id').lean();
    
    if (mcqs.length === 0) {
      return NextResponse.json({ error: "No MCQs found for this selection" }, { status: 404 });
    }

    if (mcqs.length < count) {
      return NextResponse.json({ error: `Only ${mcqs.length} MCQs available. Please request fewer questions.` }, { status: 400 });
    }

    // Randomize and select 'count' MCQs
    const shuffled = mcqs.sort(() => 0.5 - Math.random());
    const selectedIds = shuffled.slice(0, count).map(m => m._id);

    const adminId = (session.user as any).id;

    await Test.create({
      title,
      subjectId,
      chapterId: chapterId || undefined,
      mcqIds: selectedIds,
      createdBy: adminId,
      isPublished: true,
    });

    return NextResponse.json({ message: "Random Test generated successfully" }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
