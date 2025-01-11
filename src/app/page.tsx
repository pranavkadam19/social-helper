import React from "react";
import Link from "next/link";
import { Auth } from "@/components/Auth.tsx";
import { Logo } from "@/components/Logo.tsx";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function Home() {
  const { userId } = auth();

  if (userId) {
    // Check if user exists in our database
    const existingUser = await db.user.findUnique({
      where: { userId },
    });

    // If new user, create account with free credits
    if (!existingUser) {
      await db.user.create({
        data: {
          userId,
          totalCredit: 10000, // Free credits for new users
        },
      });
    }

    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 mt-5 lg:px-6 h-14 flex items-center">
        <Logo />
        <nav className="ml-auto hidden lg:flex gap-4 sm:gap-6">
          <Auth />
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center ">
              <div className="space-y-2 ">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-7xl ">
                  Ultimate AI Content Suite
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Our platform provides powerful AI tools for generating social
                  media content, transcribing videos, downloading YouTube clips,
                  and gathering thumbnail feedback.
                </p>
              </div>
            </div>
            <div className="flex flex-col mt-24 items-center justify-center text-center">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                Key Features
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary p-2 text-primary-foreground"></div>
                  <div>
                    <h3 className="text-lg font-bold">AI Content Generation</h3>
                    <p className="text-muted-foreground">
                      Effortlessly create social media captions and compelling
                      content with advanced AI algorithms.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary p-2 text-primary-foreground"></div>
                  <div>
                    <h3 className="text-lg font-bold">Video Transcription</h3>
                    <p className="text-muted-foreground">
                      Quickly convert video audio to accurate text, making it
                      easy to repurpose and share content.
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary p-2 text-primary-foreground"></div>
                  <div>
                    <h3 className="text-lg font-bold">
                      YouTube Video Downloader
                    </h3>
                    <p className="text-muted-foreground">
                      Download YouTube videos in various formats for offline
                      viewing and editing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
