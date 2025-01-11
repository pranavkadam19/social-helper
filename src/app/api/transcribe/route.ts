import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const language = formData.get("language") as string;

    if (!file) {
      return new NextResponse("No file provided", { status: 400 });
    }

    // Here you would use the language parameter with your transcription service
    const transcription = `This is a placeholder transcription in ${language}. You need to integrate with a transcription service.`;

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("[TRANSCRIPTION_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
