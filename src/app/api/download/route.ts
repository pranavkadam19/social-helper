import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
        { status: 400 }
      );
    }

    const info = await ytdl.getInfo(url);

    // Filter formats to get only those with both video and audio
    const formats = info.formats.filter(
      (format) =>
        format.hasVideo &&
        format.hasAudio &&
        format.container === "mp4" &&
        format.qualityLabel // Only include formats with quality info
    );

    // Sort by quality (resolution) in descending order
    formats.sort((a, b) => {
      const qualityA = parseInt(a.qualityLabel?.replace("p", "") || "0");
      const qualityB = parseInt(b.qualityLabel?.replace("p", "") || "0");
      return qualityB - qualityA;
    });

    // Get the highest quality format
    const format = formats[0];

    if (!format) {
      return NextResponse.json(
        { error: "No suitable format found" },
        { status: 400 }
      );
    }

    console.log(
      `Downloading: ${info.videoDetails.title} in ${format.qualityLabel}`
    );

    // Create video stream with the selected format
    const videoStream = ytdl(url, { format });

    // Return stream as response
    return new NextResponse(Readable.from(videoStream) as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${info.videoDetails.title}.mp4"`,
        "Content-Type": "video/mp4",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to process video" },
      { status: 500 }
    );
  }
}
