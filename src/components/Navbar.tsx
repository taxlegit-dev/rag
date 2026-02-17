"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, User, ChevronDown, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export const Navbar = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    signOut();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="relative z-50 bg-slate-900/50 backdrop-blur-lg border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">
            SOP<span className="text-purple-400">AI</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8 text-gray-300">
          <Link href="/" className="hover:text-purple-400 transition">
            Home
          </Link>
          {/* <Link href="/#features" className="hover:text-purple-400 transition">
            Features
          </Link> */}

          <Link
            href="/generate-sop"
            className="hover:text-purple-400 transition"
          >
            Generate SOP
          </Link>
          <Link
            href="/dashboard/sops"
            className="hover:text-purple-400 transition"
          >
            View SOP
          </Link>
          <Link href="/pricing" className="hover:text-purple-400 transition">
            Pricing
          </Link>
        </div>

        {/* Buttons or Profile */}
        <div className="flex space-x-4">
          {status === "loading" ? (
            <div className="text-white">Loading...</div>
          ) : session ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
              >
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                    height={10}
                    width={20}
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-purple-500/20 z-50">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-white hover:bg-slate-700 transition"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-slate-700 transition flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-white hover:text-purple-400 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
