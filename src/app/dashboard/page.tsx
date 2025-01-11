"use client";

import { SearchDashboard } from "./_components/search-dashboard";
import { useState } from "react";
import TemplateList from "./_components/template-list";
const Dashboard = () => {
  const [searchInput, setSearchInput] = useState<string | undefined>();

  return (
    <div>
      <SearchDashboard onSearchInput={setSearchInput} />
      <TemplateList searchInput={searchInput} />
    </div>
  );
};
export default Dashboard;
