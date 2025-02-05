import { ReactNode } from "react";
import Navbar from "@/components/PollNavbar";

interface PollLayoutProps {
  children: ReactNode;
}

const PollLayout = ({ children }: PollLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
};

export default PollLayout;
