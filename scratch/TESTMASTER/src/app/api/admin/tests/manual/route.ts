import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Test } from "@/models/Test";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { title, subjectId, chapterId, mcqIds } = await req.json();

    if (!title || !subjectId || !mcqIds || mcqIds.length === 0) {
      return NextResponse.json({ error: "Missing required fields or no MCQs selected" }, { status: 400 });
    }

    await connectToDatabase();
    const adminId = (session.user as any).id;

    await Test.create({
      title,
      subjectId,
      chapterId: chapterId || undefined,
      mcqIds,
      createdBy: adminId,
      isPublished: true,
    });

    return NextResponse.json({ message: "Manual Test generated successfully" }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
