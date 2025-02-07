import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db"; // Adjust import based on your database setup

export async function DELETE(
  req: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const pollId = params.pollId;

    const existingPoll = await db.poll.findUnique({
      where: {
        id: pollId,
        userId: userId,
      },
    });

    if (!existingPoll) {
      return NextResponse.json(
        { message: "Poll not found or unauthorized" },
        { status: 403 }
      );
    }

    await db.poll.delete({
      where: { id: pollId },
    });

    return NextResponse.json(
      { message: "Poll deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Poll deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
