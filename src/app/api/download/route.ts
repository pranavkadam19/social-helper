import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

export const runtime = "nodejs";

function sanitizeFilename(filename: string): string {
  // Remove special characters and replace spaces with underscores
  return filename
    .replace(/['"…]/g, "") // Remove quotes and ellipsis
    .replace(/[^a-zA-Z0-9-_.]/g, "_") // Replace other special chars with underscore
    .replace(/_+/g, "_") // Replace multiple underscores with single
    .trim();
}

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
    const formats = info.formats.filter(
      (format) =>
        format.hasVideo &&
        format.hasAudio &&
        format.container === "mp4" &&
        format.qualityLabel
    );

    formats.sort((a, b) => {
      const qualityA = parseInt(a.qualityLabel?.replace("p", "") || "0");
      const qualityB = parseInt(b.qualityLabel?.replace("p", "") || "0");
      return qualityB - qualityA;
    });

    const format = formats[0];
    if (!format) {
      return NextResponse.json(
        { error: "No suitable format found" },
        { status: 400 }
      );
    }

    const safeFilename = sanitizeFilename(info.videoDetails.title);
    const videoStream = ytdl(url, { format });

    return new NextResponse(Readable.from(videoStream) as any, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeFilename}.mp4"`,
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
