"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
export async function getSignedURL() {
  const { userId } = await auth();

  if (!userId) {
    console.error("No userId found in auth()");
    return { error: "Not authenticated" };
  }
  return {
    success: {
      url: "",
    },
  };
  /* trunk-ignore(prettier/SyntaxError) */
}
