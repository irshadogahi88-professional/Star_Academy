import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { MCQ } from "@/models/MCQ";
import { Subject } from "@/models/Subject";
import { Chapter } from "@/models/Chapter";
import { Test } from "@/models/Test";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { mcqs, subjectName, chapterName, testTitle, subjectId } = await req.json();

    if (!mcqs || !Array.isArray(mcqs)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectToDatabase();
    
    const adminId = (session.user as any).id;

    let subject;
    if (subjectId) {
      subject = await Subject.findById(subjectId);
    } 
    
    if (!subject) {
      const subName = subjectName || "General Knowledge";
      subject = await Subject.findOne({ name: subName });
      if (!subject) {
        subject = await Subject.create({ name: subName, createdBy: adminId });
      }
    }

    const chapName = chapterName || "Auto-Generated Chapter";
    let chapter = await Chapter.findOne({ subjectId: subject._id, name: chapName });
    if (!chapter) {
      chapter = await Chapter.create({ 
        subjectId: subject._id, 
        name: chapName, 
        order: 1 
      });
    }

    const title = testTitle || `${subject.name} - ${chapter.name} Test`;

    const formattedMCQs = mcqs.map((mcq: any, index: number) => ({
      subjectId: subject._id,
      chapterId: chapter._id,
      order: index + 1,
      question: mcq.question || "Untitled Question",
      options: Array.isArray(mcq.options) && mcq.options.length > 0 ? mcq.options : ["Option A", "Option B", "Option C", "Option D"],
      correctIndex: typeof mcq.correctIndex === 'number' ? mcq.correctIndex : 0,
      explanation: mcq.explanation || "",
      isActive: true,
    }));

    await MCQ.insertMany(formattedMCQs);

    await Test.create({
      title: title,
      subjectId: subject._id,
      chapterId: chapter._id,
      createdBy: adminId,
      isPublished: true,
    });

    return NextResponse.json({ message: `Successfully inserted ${formattedMCQs.length} MCQs and created a Test!` }, { status: 201 });
  } catch (error: any) {
    console.error("Error committing MCQs:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
