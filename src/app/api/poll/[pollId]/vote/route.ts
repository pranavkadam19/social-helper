// app/api/poll/[pollId]/vote/route.ts

import { NextRequest, NextResponse } from "next/server";
import { POST_VOTE } from "../../route"; // Import the existing vote handler

export async function POST(
  req: NextRequest,
  { params }: { params: { pollId: string } }
) {
  return POST_VOTE(req, params.pollId);
}
