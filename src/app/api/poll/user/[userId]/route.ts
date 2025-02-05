// app/api/poll/user/[userId].ts

import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import { db } from "@/lib/db"; // Import the Prisma client
import { getAuth } from "@clerk/nextjs/server"; // Correct import for session handling in Next.js 14

// Handler for fetching polls by userId
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Extract the userId from the dynamic route parameter
    const { userId } = params;

    // Check the authentication session using Clerk
    console.log("Fetching polls for user:", userId);
    const { userId: authenticatedUserId } = getAuth(req); // Use getAuth to get the current authenticated user's ID
    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch polls created by the user
    const polls = await db.poll.findMany({
      where: {
        userId,
        isActive: true, // Only active polls
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true }, // Include the number of votes for each option
            },
          },
        },
        _count: {
          select: { votes: true }, // Include the total votes for the poll
        },
      },
      orderBy: {
        createdAt: "desc", // Order by creation date (newest first)
      },
    });

    // Return the polls in the response
    return NextResponse.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}
