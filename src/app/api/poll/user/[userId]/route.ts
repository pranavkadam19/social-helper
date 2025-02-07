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
    const { userId } = params;
    const { userId: authenticatedUserId } = getAuth(req);

    if (!authenticatedUserId || authenticatedUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const polls = await db.poll.findMany({
      where: { userId },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform polls to include actual vote counts
    const pollsWithVotes = polls.map((poll) => ({
      ...poll,
      options: poll.options.map((option) => ({
        ...option,
        votes: option._count.votes || 0,
      })),
      totalVotes: poll.options.reduce(
        (sum, option) => sum + (option._count.votes || 0),
        0
      ),
    }));

    return NextResponse.json(pollsWithVotes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch polls" },
      { status: 500 }
    );
  }
}
