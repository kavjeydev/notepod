import connectMongoDB from "../../lib/dbConnect";
import Document from "../../models/documents";
import { NextResponse } from "next/server";
import { requireAuth } from "../../middleware/auth";
import { auth, getAuth } from "@clerk/nextjs/server";
import mongoose from "mongoose";

export async function POST(req: any) {
  const { userId }: { userId: string | null } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "Not authorized." }, { status: 405 });
  }

  const { id, parentId } = await req.json();

  if (!id) {
    return NextResponse.json({ message: "Not authorized." }, { status: 405 });
  }

  await connectMongoDB();

  const existingDocument = await Document.findById(id);
  if (!existingDocument) {
    return NextResponse.json(
      { message: "Document doesn't exist." },
      { status: 405 },
    );
  }

  if (existingDocument.userId !== userId) {
    return NextResponse.json({ message: "Not authorized." }, { status: 405 });
  }

  let destinationDocument = null;
  if (parentId) {
    // Validate parentId
    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return NextResponse.json(
        { message: "Invalid parent id." },
        { status: 405 },
      );
    }
  }

  destinationDocument = await Document.findById(parentId);
  if (!destinationDocument) {
    return NextResponse.json(
      { message: "Destination document doesn't exist." },
      { status: 405 },
    );
  }

  // Ensure the destination is a folder
  if (!destinationDocument.isFolder) {
    return NextResponse.json(
      { message: "Destination document must be a folder." },
      { status: 405 },
    );
  }

  if (existingDocument.isFolder) {
    let currentParentId = parentId;
    while (currentParentId) {
      if (currentParentId.toString() === id.toString()) {
        return NextResponse.json(
          { message: "Cannot move items into child ite." },
          { status: 405 },
        );
      }
      const currentParent = await Document.findById(currentParentId);
      if (!currentParent || !currentParent.parentDocument) {
        break;
      }
      currentParentId = currentParent.parentDocument;
    }
  }

  existingDocument.parentDocument = parentId || null;
  await existingDocument.save();

  // await Document.create({ name, email });

  return NextResponse.json({ message: "Document moved." }, { status: 201 });
}
