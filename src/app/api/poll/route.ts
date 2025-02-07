// app/api/poll/route.ts

import { NextResponse } from "next/server";
import { deductCredits } from "@/lib/credits";
import { db } from "@/lib/db";

interface PollOption {
  text: string;
  imageUrl?: string;
}

interface PollRequest {
  userId: string;
  title: string;
  description?: string;
  options: PollOption[];
}

export async function POST(req: Request) {
  try {
    const body: PollRequest = await req.json();
    const { userId, title, description, options } = body;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (!title || !options || options.length < 2 || options.length > 4) {
      return NextResponse.json(
        { error: "Invalid input: Title and 2-4 options required" },
        { status: 400 }
      );
    }

    // Calculate content length for credit deduction

    // Deduct credits based on content length
    await deductCredits(title, 500, userId);

    // Create poll with options
    const poll = await db.poll.create({
      data: {
        title,
        description,
        userId,
        options: {
          create: options.map((option) => ({
            text: option.text,
            imageUrl: option.imageUrl ?? null,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    // Log the creation in AIOutput
    await db.aIOutput.create({
      data: {
        userId,
        title,
        description: `Created poll: ${title}`,
        templateUsed: "poll_creation",
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const userId = searchParams.get("userId");

    const whereClause = userId ? { userId } : {};

    const polls = await db.poll.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
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

    // Transform polls to include actual vote counts and calculate totalVotes
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
// Handler for single poll
export async function GET_POLL(req: Request, pollId: string) {
  try {
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
      },
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Transform poll to include actual vote counts
    const pollWithVotes = {
      ...poll,
      options: poll.options.map((option) => ({
        ...option,
        votes: option._count.votes || 0,
      })),
      totalVotes: poll.options.reduce(
        (sum, option) => sum + (option._count.votes || 0),
        0
      ),
    };

    return NextResponse.json(pollWithVotes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch poll" },
      { status: 500 }
    );
  }
}

// Handler for voting
export async function POST_VOTE(req: Request, pollId: string) {
  try {
    const { userId, optionId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify poll exists
    const pollExists = await db.poll.findUnique({
      where: { id: pollId },
    });

    if (!pollExists) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Check if user has already voted
    const existingVote = await db.vote.findFirst({
      where: {
        pollId,
        userId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: "User has already voted on this poll" },
        { status: 400 }
      );
    }

    // Create vote
    const vote = await db.vote.create({
      data: {
        userId,
        pollId,
        optionId,
      },
    });

    // Log the vote in AIOutput
    await db.aIOutput.create({
      data: {
        userId,
        title: "Poll Vote",
        description: `Voted on poll: ${pollId}`,
        templateUsed: "poll_vote",
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error("Vote submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit vote" },
      { status: 400 }
    );
  }
}
