// app/api/getrepos/route.ts
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

interface OAuthExternalAccount {
  provider: string;
  oauth_access_token?: string; // Correct property name
}

export async function GET(request: Request) {
  try {
    // Authenticate the user and get their userId
    const { userId } = await auth();

    if (!userId) {
      console.error("No userId found in auth()");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch user details from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Debug: Log external accounts to verify provider names and available tokens
    // console.log("User externalAccounts:", user.externalAccounts);

    // Find the GitHub external account
    const githubAccount = user.externalAccounts.find(
      (acc) => acc.provider === "oauth_github", // Ensure this matches your provider name
    );

    if (!githubAccount) {
      console.error("No GitHub external account found");
      return NextResponse.json(
        { error: "No GitHub external account found" },
        { status: 400 },
      );
    }

    // Use the correct property
    const response = await clerkClient.users.getUserOauthAccessToken(
      userId,
      "oauth_github",
    );

    const githubAccessToken = response.data[0].token;

    if (!githubAccessToken) {
      console.error("No oauth_access_token found in GitHub external account");
      return NextResponse.json(
        { error: "No GitHub access token found" },
        { status: 400 },
      );
    }

    // Use the token to fetch the user's GitHub repositories
    const ghResponse = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${githubAccessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!ghResponse.ok) {
      const errorText = await ghResponse.text();
      console.error("GitHub API error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch repositories" },
        { status: 500 },
      );
    }

    const repos = await ghResponse.json();
    return NextResponse.json(repos, { status: 200 });
  } catch (error) {
    console.error("Error in getrepos API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
