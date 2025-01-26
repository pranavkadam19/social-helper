import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { TranscriptionService } from "@/lib/transcriptionService";
import { NextRequest } from "next/server";
import { deductCredits } from "@/lib/credits";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const language = formData.get("language") as string;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    if (!language) {
      return new NextResponse("Language not specified", { status: 400 });
    }

    // Optionally, define deduction logic based on transcription length or file size
    // For simplicity, we'll deduct a fixed amount per transcription
    const DEDUCT_AMOUNT = 1000; // Adjust as needed

    // Deduct credits
    const creditResult = await deductCredits("", DEDUCT_AMOUNT, userId);

    if (!creditResult.success) {
      return new NextResponse("Insufficient credits", { status: 403 });
    }

    // Transcribe the video
    const transcriptionService = new TranscriptionService();
    const transcription = await transcriptionService.transcribeVideo(
      file,
      language
    );

    // Optionally, save the transcription to the database
    // You can create a new entry similar to other AI outputs

    const createNewDoc = await db.aIOutput.create({
      data: {
        userId,
        title: "Video Transcription",
        description:
          "providing downloadable subtitles in srt, vtt and text format.",
        templateUsed: "",
      },
    });

    return NextResponse.json({
      text: transcription.text,
      subtitles_vtt: transcription.subtitles_vtt,
      subtitles_srt: transcription.subtitles_srt,
    });
  } catch (error: any) {
    console.error("[TRANSCRIPTION_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
