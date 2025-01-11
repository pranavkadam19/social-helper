import React from "react";
import { Sidebar } from "./_components/Sidebar";
import { AIUsage } from "./_components/Ai-usage";
const Dashboardlayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="bg-gray-50 h-screen">
      <div className="md:w-64 hidden md:block fixed">
        <Sidebar />
        <AIUsage />
      </div>

      <div className="md:ml-64 bg-gray-50 h-fit pb-5">{children}</div>
    </div>
  );
};
export default Dashboardlayout;
