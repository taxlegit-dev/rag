import React from "react";

export default function SubUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen bg-white">{children}</main>;
}
