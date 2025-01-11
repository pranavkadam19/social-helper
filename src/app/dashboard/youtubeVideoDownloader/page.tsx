"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const YoutubeVideoDownloader = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!url) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to download video");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : "video.mp4";

      // Create a blob from the response
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(downloadUrl);

      toast.success("Download started!");
      setUrl("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to download video"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            YouTube Video Downloader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter YouTube URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Downloading..." : "Download Video"}
            </Button>
          </div>
          <div className="text-sm text-gray-500 text-center mt-4">
            Downloads will be saved to your default downloads folder
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YoutubeVideoDownloader;
