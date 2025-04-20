import React from "react";

export default function Layout(props: { children: any }) {
  const { children } = props;
  return (
    <div className="flex items-center justify-center h-screen">
      {children as React.ReactNode}
    </div>
  );
}
