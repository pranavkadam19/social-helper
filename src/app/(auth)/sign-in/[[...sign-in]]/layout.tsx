import React from "react";
const layout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex items-center justify-center h-screen">{children}</div>
  );
};
export default layout;
