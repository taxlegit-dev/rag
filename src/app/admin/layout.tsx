"use client";

import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className={isLogin ? "min-h-screen" : "min-h-screen p-6"}>
        {children}
      </main>
    </div>
  );
}
