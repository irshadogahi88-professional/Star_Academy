import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Attempt } from "@/models/Attempt";
import { MCQ } from "@/models/MCQ";
import { Test } from "@/models/Test";
import { User } from "@/models/User";
import "@/models/Subject";
import "@/models/Chapter";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { answers, mode } = await req.json();
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    
    const test = await Test.findById(id);
    if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

    let mcqList: any[] = [];
    if (test.mcqIds && test.mcqIds.length > 0) {
      mcqList = await MCQ.find({ _id: { $in: test.mcqIds }, isActive: true });
    } else if (test.chapterId) {
      mcqList = await MCQ.find({ chapterId: test.chapterId, isActive: true });
    }
    
    let score = 0;
    const dbAnswers = [];
    const uiAnswers = [];

    // Server-side grading across ALL questions in the test
    for (const mcq of mcqList) {
      const studentAns = answers.find(a => a.mcqId === mcq._id.toString());
      const isSkipped = !studentAns || studentAns.selectedIndex === undefined || studentAns.selectedIndex === null;
      const isCorrect = !isSkipped && mcq.correctIndex === studentAns.selectedIndex;
      
      if (isCorrect) score += 1;

      dbAnswers.push({
        mcqId: mcq._id,
        selectedIndex: isSkipped ? -1 : studentAns.selectedIndex,
        correct: isCorrect,
        timeTakenSec: isSkipped ? 0 : (studentAns.timeTakenSec || 0),
      });
      
      uiAnswers.push({
        mcqId: mcq._id,
        selectedIndex: isSkipped ? -1 : studentAns.selectedIndex,
        correct: isCorrect,
        correctIndex: mcq.correctIndex,
        explanation: mcq.explanation
      });
    }

    const totalQuestions = mcqList.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    const attempt = await Attempt.create({
      userId: (session.user as any).id,
      testId: id,
      mode: mode === "exam" ? "timed" : (mode || "practice"),
      startedAt: new Date(),
      submittedAt: new Date(),
      answers: dbAnswers,
      score,
      totalQuestions,
      percentage
    });

    // Update user's last activity date
    await User.findByIdAndUpdate((session.user as any).id, { lastActivityAt: new Date() });

    return NextResponse.json({ 
      message: "Test submitted successfully", 
      resultId: attempt._id,
      score,
      totalQuestions,
      percentage,
      answers: uiAnswers
    }, { status: 201 });
  } catch (error: any) {
    console.error("Test Submit Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
