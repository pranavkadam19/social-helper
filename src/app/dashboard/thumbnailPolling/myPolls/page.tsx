"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Clock, Edit, Trash2, ExternalLink } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

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
  options: PollOption[];
  totalVotes: number;
}

const MyPolls = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pollToDelete, setPollToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (userId) fetchMyPolls();
  }, [userId]);

  const fetchMyPolls = async () => {
    try {
      const response = await fetch(`/api/poll/user/${userId}`);
      console.log("Fetching polls for user:", userId);
      if (!response.ok) throw new Error("Failed to fetch polls");
      const data = await response.json();
      setPolls(data);
    } catch (err) {
      setError("Failed to load your polls");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    try {
      const response = await fetch(`/api/poll/${pollId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete poll");

      // Remove poll from state
      setPolls(polls.filter((poll) => poll.id !== pollId));
      setPollToDelete(null);
    } catch (err) {
      setError("Failed to delete poll");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Polls</h1>
        <Button onClick={() => router.push("/dashboard/thumbnailPolling")}>
          Create New Poll
        </Button>
      </div>

      {loading ? (
        <div className="text-center">Loading your polls...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : polls.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              You haven't created any polls yet.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/polls/create")}
            >
              Create Your First Poll
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {polls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{poll.title}</CardTitle>
                    <CardDescription>{poll.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/polls/${poll.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setPollToDelete(poll.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {poll.options.map((option) => (
                    <div key={option.id} className="relative">
                      <img
                        src={option.imageUrl}
                        alt={option.text}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                        {((option.votes / poll.totalVotes) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center">
                      <BarChart className="h-4 w-4 mr-1" />
                      {poll.totalVotes} votes
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(poll.createdAt)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/polls/${poll.id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!pollToDelete}
        onOpenChange={() => setPollToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Poll</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this poll? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pollToDelete && handleDelete(pollToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyPolls;
