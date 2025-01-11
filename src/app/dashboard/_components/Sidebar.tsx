"use client";

import { Logo } from "@/components/Logo.tsx";
import { cn } from "@/lib/utils";
import {
  CreditCard,
  History,
  WandSparkles,
  Download,
  ChartColumn,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const menuList = [
  {
    name: "Content generation",
    icon: WandSparkles,
    path: "/dashboard",
  },
  {
    name: "Video Transcription",
    icon: Video,
    path: "/dashboard/videoTranscription",
  },
  {
    name: "Video Downloader",
    icon: Download,
    path: "/dashboard/youtubeVideoDownloader",
  },
  {
    name: "Thumbnail Polling",
    icon: ChartColumn,
    path: "/dashboard/thumbnailPolling",
  },
  {
    name: "Output History",
    icon: History,
    path: "/dashboard/history",
  },
  {
    name: "Upgrade To Premium",
    icon: CreditCard,
    path: "/dashboard/upgrade",
  },
];

export const Sidebar = () => {
  const path = usePathname();

  console.log("path", path);
  return (
    <div className="p-5 bg-white h-[600px] flex flex-col">
      <Logo />

      <div className="mt-4 flex flex-col flex-grow">
        {menuList.map((menu) => (
          <Link
            href={menu.path}
            key={menu.name}
            className={cn(
              "flex gap-2 mb-2 p-3 hover:bg-primary hover:text-white cursor-pointer rounded-lg items-center",
              path === menu.path && "bg-primary text-white"
            )}
          >
            <menu.icon className="h-6 w-6"></menu.icon>
            <h2 className="text-sm">{menu.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};
