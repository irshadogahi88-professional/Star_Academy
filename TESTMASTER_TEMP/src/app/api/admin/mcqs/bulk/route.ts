import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { MCQ } from "@/models/MCQ";
import { Test } from "@/models/Test";
import "@/models/Subject";
import "@/models/Chapter";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    await MCQ.updateMany({ chapterId }, { isActive: false });
    // Also unpublish any tests that were automatically tied to this chapter
    await Test.updateMany({ chapterId }, { isPublished: false });

    return NextResponse.json({ message: "Bulk deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
