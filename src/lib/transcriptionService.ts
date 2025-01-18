import { AssemblyAI } from "assemblyai";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

const FFMPEG_PATH =
  "C:\\Users\\prana\\Downloads\\ffmpeg-2025-01-13-git-851a84650e-full_build\\ffmpeg-2025-01-13-git-851a84650e-full_build\\bin\\ffmpeg.exe";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_API_KEY!,
});

export class TranscriptionService {
  async transcribeVideo(
    file: File,
    language: string
  ): Promise<{
    text: string;
    subtitles_vtt: string;
    subtitles_srt: string;
  }> {
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size exceeds 25MB limit");
      }

      const tmpDir = path.join(process.cwd(), "tmp");
      const tempVideoPath = path.join(tmpDir, `${Date.now()}-${file.name}`);
      const tempAudioPath = tempVideoPath.replace(
        path.extname(tempVideoPath),
        ".wav"
      );

      await fs.promises.mkdir(tmpDir, { recursive: true });
      const buffer = await file.arrayBuffer();
      await fs.promises.writeFile(tempVideoPath, Buffer.from(buffer));

      try {
        await execAsync(
          `"${FFMPEG_PATH}" -i "${tempVideoPath}" -vn -acodec pcm_s16le -ac 1 -ar 16000 -f wav "${tempAudioPath}"`
        );
      } catch (ffmpegError) {
        console.error("FFmpeg error:", ffmpegError);
        throw new Error("Failed to process video file");
      }

      // Read the audio file
      const audioData = await fs.promises.readFile(tempAudioPath);

      // Upload to AssemblyAI
      const uploadUrl = await client.files.upload(audioData);

      // Request subtitles formats
      const transcript = await client.transcripts.transcribe({
        audio: uploadUrl,
        language_code: language,
      });

      const result = await client.transcripts.waitUntilReady(transcript.id);

      // Get subtitles
      const vtt = await client.transcripts.subtitles(transcript.id, "vtt");
      const srt = await client.transcripts.subtitles(transcript.id, "srt");

      // Cleanup
      await fs.promises.unlink(tempVideoPath);
      await fs.promises.unlink(tempAudioPath);

      return {
        text: result.text || "No transcription available",
        subtitles_vtt: vtt,
        subtitles_srt: srt,
      };
    } catch (error) {
      console.error("Transcription error:", error);
      throw error;
    }
  }
}
