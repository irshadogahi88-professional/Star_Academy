import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Test } from "@/models/Test";
import "@/models/Subject"; // Prevent tree-shaking

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const tests = await Test.find({ isPublished: true })
      .populate({ path: "subjectId", select: "name" })
      .sort({ createdAt: -1 });

    return NextResponse.json({ tests }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
