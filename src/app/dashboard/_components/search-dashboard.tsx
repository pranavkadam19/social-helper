import { SearchIcon } from "lucide-react";
import React from "react";
import { Categories } from "./categories";
import { SignedIn, UserButton } from "@clerk/nextjs";

const categories = [
  {
    name: "All",
    value: "All",
  },
  {
    name: "Youtube",
    value: "Youtube",
  },
  {
    name: "Twitch",
    value: "Twitch",
  },
  {
    name: "Instagram",
    value: "Instagram",
  },
  {
    name: "Reddit",
    value: "Reddit",
  },
  {
    name: "Linkedin",
    value: "Linkedin",
  },
  {
    name: "Threads",
    value: "Threads",
  },
];

export const SearchDashboard = ({
  onSearchInput,
}: {
  onSearchInput: React.Dispatch<React.SetStateAction<string | undefined>>;
}) => {
  return (
    <div className="mx-5 py-2">
      <div className="flex  md:flew-row gap-2 mt-5 py-6 px-4 bg-white rounded">
        <div className="flex gap-2 items-center p-2 border rounded-full bg-white w-full md:w-[20%]">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-black"
            onChange={(e) => onSearchInput(e.target.value)}
          />
        </div>
        <Categories items={categories} />
        <div className="ml-auto">
          <div className="flex items-center gap-2">
            <SignedIn>
              <UserButton />
              <span className="text-lg">Profile</span>
            </SignedIn>
          </div>
        </div>
      </div>
    </div>
  );
};