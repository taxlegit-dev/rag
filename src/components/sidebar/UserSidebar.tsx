"use client";

import {
  SquareKanban,
  PersonStanding,
  Building2,
  ScrollText,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type TabType = "dashboard" | "departments" | "subusers" | "sops";

interface UserSidebarProps {
  isSubUser: boolean;
}

export default function UserSidebar({ isSubUser }: UserSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (isSubUser) return null;

  const getActiveTab = (): TabType => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/dashboard/departments") return "departments";
    if (pathname === "/dashboard/subusers") return "subusers";
    if (pathname === "/dashboard/sops") return "sops";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabType) => {
    const routes: Record<TabType, string> = {
      dashboard: "/dashboard",
      departments: "/dashboard/departments",
      subusers: "/dashboard/subusers",
      sops: "/dashboard/sops",
    };
    router.push(routes[tab]);
    setIsMobileMenuOpen(false); // Close mobile menu after selection
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`h-screen bg-slate-800 border-r border-slate-700 z-30
        w-full md:w-64 absolute inset-y-0 left-0 md:relative transition-transform duration-300 ease-in-out
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 pt-16 md:pt-6">
          <h2 className="text-xl font-bold text-white mb-6">Dashboard</h2>
          <nav className="space-y-2">
            <button
              onClick={() => handleTabClick("dashboard")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "dashboard"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <SquareKanban className="w-5 h-5 mr-3" />
                Overview
              </div>
            </button>
            <button
              onClick={() => handleTabClick("sops")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "sops"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <ScrollText className="w-5 h-5 mr-3" />
                SOPs
              </div>
            </button>
            <button
              onClick={() => handleTabClick("departments")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "departments"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-3" />
                Departments
              </div>
            </button>
            <button
              onClick={() => handleTabClick("subusers")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeTab === "subusers"
                  ? "bg-purple-600 text-white"
                  : "text-gray-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <div className="flex items-center">
                <PersonStanding className="w-5 h-5 mr-3" />
                Sub-users
              </div>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
