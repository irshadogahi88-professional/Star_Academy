import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import { Chapter } from "@/models/Chapter";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    await connectToDatabase();
    
    const query = subjectId ? { subjectId } : {};
    const chapters = await Chapter.find(query).sort({ name: 1 }).lean();
    
    return NextResponse.json({ chapters }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { name, subjectId } = await req.json();
    if (!name || !subjectId) return NextResponse.json({ error: "Name and subjectId required" }, { status: 400 });

    await connectToDatabase();
    
    // Check if exists
    const existing = await Chapter.findOne({ name: new RegExp(`^${name}$`, 'i'), subjectId });
    if (existing) {
      return NextResponse.json({ chapter: existing }, { status: 200 });
    }

    const chapter = await Chapter.create({ name, subjectId });
    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
