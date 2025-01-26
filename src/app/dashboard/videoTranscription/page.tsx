"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Upload } from "lucide-react";

const VideoTranscription = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [transcription, setTranscription] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<{ vtt: string; srt: string }>({
    vtt: "",
    srt: "",
  });
  const [isTranscribed, setIsTranscribed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setIsTranscribed(false);
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleTranscribe = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setTranscription("");
      setIsTranscribed(false);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "en");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Transcription failed");
      }

      const data = await response.json();
      setTranscription(data.text);
      setSubtitles({
        vtt: data.subtitles_vtt,
        srt: data.subtitles_srt,
      });
      setIsTranscribed(true);
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type: "text" | "vtt" | "srt") => {
    let content = "";
    let filename = "";
    let mimeType = "text/plain";

    switch (type) {
      case "text":
        content = transcription;
        filename = "transcription.txt";
        break;
      case "vtt":
        content = subtitles.vtt;
        filename = "subtitles.vtt";
        mimeType = "text/vtt";
        break;
      case "srt":
        content = subtitles.srt;
        filename = "subtitles.srt";
        mimeType = "application/x-subrip";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle>Video Transcription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="w-full"
            />
            <Button
              onClick={handleTranscribe}
              disabled={!file || loading || isTranscribed}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : isTranscribed ? (
                "Transcribed"
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Transcribe
                </>
              )}
            </Button>
          </div>

          {error && <div className="text-red-500 text-center">{error}</div>}

          {transcription && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                {transcription}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload("text")}
                  className="flex-1"
                >
                  Download Text
                </Button>
                <Button
                  onClick={() => handleDownload("vtt")}
                  className="flex-1"
                >
                  Download VTT
                </Button>
                <Button
                  onClick={() => handleDownload("srt")}
                  className="flex-1"
                >
                  Download SRT
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoTranscription;
