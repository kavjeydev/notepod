import connectMongoDB from "../../lib/dbConnect";
import Document from "../../models/documents";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Error: No signed in user" },
      { status: 401 },
    );
  }

  const { name, email } = await req.json();

  await connectMongoDB();

  await Document.create({ name, email });

  return NextResponse.json({ message: "user created" }, { status: 201 });
}
