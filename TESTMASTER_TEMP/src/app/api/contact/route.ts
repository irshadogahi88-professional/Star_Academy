import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import { Message } from "@/models/Message";

export async function POST(req: Request) {
  try {
    const { name, emailOrNumber, title, details } = await req.json();

    if (!name || !emailOrNumber || !title || !details) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    await connectToDatabase();
    
    await Message.create({ name, emailOrNumber, title, details });

    return NextResponse.json({ message: "Message sent successfully" }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
