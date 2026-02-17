// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLinks, userLinks } from "@/lib/sidebarLinks";
import { LogOut } from "lucide-react";
import { UserCircle } from "lucide-react";

interface SidebarProps {
  role?: string;
}

export default function Sidebar({ role = "user" }: SidebarProps) {
  const pathname = usePathname();

  const links = role.toLowerCase() === "admin" ? adminLinks : userLinks;

  // Separate main menu and bottom menu
  const mainMenuItems = links.filter((link) => link.title !== "Logout");
  const bottomMenuItems = [
  ...links.filter(
    (link) =>
      link.title === "Profile" ||
      link.title === "Settings" ||
      link.title === "Change Password"
  ),
  {
    title: "Change Password",
    href: role.toLowerCase() === "admin"
      ? "/admin/change-password"
      : "/change-password",
    icon: UserCircle, // you can also use Lock if preferred
  },
  {
    title: "Logout",
    href: "/logout",
    icon: LogOut,
  },
];


  const isActive = (href: string) => pathname === href;

  return (
    <aside className="flex flex-col h-screen w-64 bg-gray-900 text-white">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">
          {role === "admin" ? "Admin Panel" : "User Panel"}
        </h1>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <Icon size={20} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
