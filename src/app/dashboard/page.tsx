"use client";

import { SearchDashboard } from "./_components/search-dashboard";
import { useState, useEffect } from "react";
import TemplateList from "./_components/template-list";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [searchInput, setSearchInput] = useState<string | undefined>();
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while checking auth status
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <div>
      <SearchDashboard onSearchInput={setSearchInput} />
      <TemplateList searchInput={searchInput} />
    </div>
  );
};

export default Dashboard;
