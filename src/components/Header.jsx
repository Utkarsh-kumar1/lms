"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// Define the navigation options
const NAV_OPTIONS = [
  { name: "Dashboard", url: "/dashboard" },
  { name: "Activity", url: "/activity" },
  { name: "Revision", url: "/revision" },
];

// Reusable Button Component
const Button = ({ href, onClick, children, className }) => {
  return href ? (
    <Link
      href={href}
      className={`px-4 py-2 rounded-md text-white transition-colors duration-300 shadow-sm hover:shadow-md ${className}`}
    >
      {children}
    </Link>
  ) : (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md text-white transition-colors duration-300 shadow-sm hover:shadow-md ${className}`}
    >
      {children}
    </button>
  );
};

function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="w-full h-16 bg-indigo-600 text-white flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center">
        <span className="font-bold text-xl">Logo</span>
      </div>
      <div className="flex items-center space-x-4">
        {status === "loading" && (
          <div className="animate-pulse flex items-center space-x-4">
            <Skeleton className="h-8 w-24 rounded-md bg-gray-300" />
            <Skeleton className="h-8 w-24 rounded-md bg-gray-300" />
            <Skeleton className="h-8 w-24 rounded-md bg-gray-300" />
          </div>
        )}
        {status === "authenticated" && (
          <div className="flex items-center space-x-4">
            {NAV_OPTIONS.map((option) => (
              <Button
                key={option.name}
                href={option.url}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {option.name}
              </Button>
            ))}
            <Button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-500 hover:bg-red-600"
            >
              Sign Out
            </Button>
          </div>
        )}
        {status === "unauthenticated" && (
          <div className="text-lg flex space-x-4">
            <Button href="/" className="bg-gray-700 hover:bg-gray-800">
              Home
            </Button>
            <Button href="/sign-in" className="bg-gray-700 hover:bg-gray-800">
              Sign In
            </Button>
            <Button href="/sign-up" className="bg-gray-700 hover:bg-gray-800">
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
