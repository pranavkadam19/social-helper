"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, Upload } from "lucide-react";

const CreatePoll = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<
    {
      text: string;
      imageFile: File | null;
      imagePreview: string;
    }[]
  >([{ text: "", imageFile: null, imagePreview: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  const handleImageChange = async (index: number, file: File | null) => {
    if (!file) return;

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      const newOptions = [...options];
      newOptions[index] = {
        ...newOptions[index],
        imageFile: file,
        imagePreview: preview,
      };
      setOptions(newOptions);
    } catch (error) {
      setError("Error processing image");
    }
  };

  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, { text: "", imageFile: null, imagePreview: "" }]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      // First upload images to your storage service
      const uploadPromises = options.map(async (option) => {
        if (!option.imageFile) return null;

        const formData = new FormData();
        formData.append("file", option.imageFile);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload image");
        const { url } = await response.json();
        return url;
      });

      const imageUrls = await Promise.all(uploadPromises);

      // Create poll with image URLs
      const pollData = {
        userId,
        title,
        description,
        options: options.map((option, index) => ({
          text: option.text,
          imageUrl: imageUrls[index],
        })),
      };

      const response = await fetch("/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create poll");
      }

      // Reset form on success
      setTitle("");
      setDescription("");
      setOptions([{ text: "", imageFile: null, imagePreview: "" }]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create poll. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userId) {
    return <div>Please log in to create a poll</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Poll</CardTitle>
        <CardDescription>
          Create a poll with up to 4 image options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Poll Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your poll title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter poll description"
            />
          </div>

          <div className="space-y-4">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder={`Option ${index + 1} text`}
                    value={option.text}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index].text = e.target.value;
                      setOptions(newOptions);
                    }}
                    required
                  />

                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageChange(index, e.target.files?.[0] || null)
                      }
                      className="hidden"
                      id={`image-${index}`}
                      required={!option.imageFile}
                    />
                    <Label
                      htmlFor={`image-${index}`}
                      className="flex items-center justify-center p-4 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                    >
                      {option.imagePreview ? (
                        <img
                          src={option.imagePreview}
                          alt={`Option ${index + 1}`}
                          className="max-h-32 object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 mb-2" />
                          <span>Upload image</span>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>

                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {options.length < 4 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Poll"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePoll;
