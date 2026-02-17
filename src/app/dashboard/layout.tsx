"use client";

import { Navbar } from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserSidebar from "@/components/sidebar/UserSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading") {
      if (!session) {
        router.push("/login");
      } else if (session.user.role === "subuser") {
        router.push("/subuser/dashboard");
      }
    }
  }, [status, router, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isSubUser = session.user.role === "subuser";

  return (
    <>
      <Navbar />
      <div className="h-screen bg-slate-900 text-white flex flex-col md:flex-row overflow-hidden">
        <UserSidebar isSubUser={isSubUser} />
        <div className="flex-1 h-screen overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
