import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { text, targetLanguage } = await request.json();

    // Create a transcript with translation
    const createResponse = await fetch(
      "https://api.assemblyai.com/v2/transcript",
      {
        method: "POST",
        headers: {
          Authorization: process.env.ASSEMBLY_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          translation_model: "basic",
          target_language: targetLanguage,
        }),
      }
    );

    if (!createResponse.ok) {
      const errorBody = await createResponse.text();
      console.error("AssemblyAI Error Response:", errorBody);
      throw new Error(`Translation initialization failed: ${errorBody}`);
    }

    const { id } = await createResponse.json();
    console.log("Translation ID:", id);

    // Poll for completion
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const pollResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${id}`,
        {
          headers: { Authorization: process.env.ASSEMBLY_API_KEY! },
        }
      );

      if (!pollResponse.ok) {
        throw new Error("Failed to poll translation status");
      }

      const result = await pollResponse.json();
      console.log("Poll status:", result.status);

      if (result.status === "completed") {
        return NextResponse.json({
          translatedText: result.text,
          subtitles_vtt: await client.transcripts.subtitles(id, "vtt"),
          subtitles_srt: await client.transcripts.subtitles(id, "srt"),
        });
      }

      if (result.status === "error") {
        throw new Error(result.error || "Translation processing failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error("Translation timed out");
  } catch (error: any) {
    console.error("[TRANSLATION_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
