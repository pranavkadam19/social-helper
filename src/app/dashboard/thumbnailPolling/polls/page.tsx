"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";

interface PollOption {
  id: string;
  text: string;
  imageUrl: string;
  votes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  author: {
    name: string;
    id: string;
  };
  options: PollOption[];
  totalVotes: number;
  hasVoted: boolean;
}

const AllPolls = () => {
  const { user } = useUser();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/poll");
      if (!response.ok) throw new Error("Failed to fetch polls");
      const data = await response.json();
      console.log("Poll data:", data);
      setPolls(data);
    } catch (err) {
      setError("Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    if (!user) {
      setError("You must be logged in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/poll/${pollId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          optionId,
          // Also include userId in the body
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit vote");
      }

      // Refresh polls after voting
      fetchPolls();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit vote");
    }
  };

  const filteredAndSortedPolls = polls
    .filter(
      (poll) =>
        poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        poll.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.totalVotes - a.totalVotes;
        case "recent":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Discover Polls</h1>
        <div className="flex gap-4 w-full sm:w-auto">
          <Input
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <div className="text-red-500 text-center p-4">{error}</div>}

      {filteredAndSortedPolls.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {searchQuery
              ? "No polls found matching your search"
              : "No polls available"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredAndSortedPolls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <CardTitle>{poll.title}</CardTitle>
                <CardDescription>
                  {poll.description}
                  <span className="text-xs text-muted-foreground ml-2">
                    by {poll.author?.name || "Anonymous"}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {poll.options.map((option) => (
                    <button
                      key={option.id}
                      className={`relative group overflow-hidden rounded-lg transition-all ${
                        !poll.hasVoted &&
                        "hover:ring-2 hover:ring-primary cursor-pointer"
                      }`}
                      onClick={() =>
                        !poll.hasVoted && handleVote(poll.id, option.id)
                      }
                      disabled={poll.hasVoted}
                    >
                      <img
                        src={option.imageUrl}
                        alt={option.text}
                        className="w-full aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">
                          {option.text}
                        </span>
                      </div>
                      {poll.hasVoted && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="text-white text-lg font-bold">
                            {((option.votes / poll.totalVotes) * 100).toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground flex justify-between items-center">
                  <span>{poll.totalVotes} votes</span>
                  <span>
                    {new Date(poll.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPolls;
