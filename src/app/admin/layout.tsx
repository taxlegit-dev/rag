"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { useCurrentRole } from "@/components/hooks/auth/useCurrentRole";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const role = useCurrentRole(); // 👈 get ro

  // Hide sidebar only on login page
  const hideSidebar = pathname === "/admin/login";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conditionally render sidebar */}
      {!hideSidebar && role && <Sidebar role={role} />}

      {/* Main content */}
      <main
        className={`flex-1 min-h-0 bg-gray-50 p-6 overflow-y-auto text-black ${
          hideSidebar ? "w-full" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
