import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

export const runtime = "nodejs";

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/['"…]/g, "") 
    .replace(/[^a-zA-Z0-9-_.]/g, "_")
    .replace(/_+/g, "_")
    .trim()
    .substring(0, 255); // Limit filename length
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    
    // Validate URL
    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    let info;
    try {
      info = await ytdl.getInfo(url);
    } catch (infoError) {
      console.error("Failed to get video info:", infoError);
      return NextResponse.json(
        { error: "Unable to retrieve video information", details: String(infoError) },
        { status: 403 }
      );
    }

    const formats = info.formats.filter(
      (format) =>
        format.hasVideo &&
        format.hasAudio &&
        format.container === "mp4" &&
        format.qualityLabel
    );

    if (formats.length === 0) {
      return NextResponse.json(
        { error: "No compatible video formats found" },
        { status: 400 }
      );
    }

    // Sort formats by quality, highest first
    formats.sort((a, b) => {
      const qualityA = parseInt(a.qualityLabel?.replace("p", "") || "0");
      const qualityB = parseInt(b.qualityLabel?.replace("p", "") || "0");
      return qualityB - qualityA;
    });

    const format = formats[0];
    const safeFilename = sanitizeFilename(info.videoDetails.title);

    let videoStream;
    try {
      videoStream = ytdl(url, { format });
    } catch (streamError) {
      console.error("Failed to create video stream:", streamError);
      return NextResponse.json(
        { error: "Could not generate video stream", details: String(streamError) },
        { status: 500 }
      );
    }

    return new NextResponse(Readable.from(videoStream) as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeFilename}.mp4"`,
        "Content-Type": "video/mp4",
      },
    });

  } catch (error) {
    console.error("Unexpected download error:", error);
    return NextResponse.json(
      { 
        error: "Unexpected error processing video", 
        details: String(error) 
      },
      { status: 500 }
    );
  }
}