"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

function Header() {
  const { data: session, status } = useSession();
  console.log(session , status);

  const NavOptions = [
    {
      name: "Dashboard",
      url: "/dashboard",
    },
    {
      name: "Activity",
      url: "/activity",
    },
    {
      name: "Revision",
      url: "/revision",
    },
  ];

  const renderNavOptions = () => {
    if (status === "loading") {
      return <div className="animate-pulse">Loading...</div>;
    }

    if (status === "authenticated") {
      return (
        <>
          {NavOptions.map((option) => (
            <a key={option.name} href={option.url} className="mx-2">
              {option.name}
            </a>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mx-2"
          >
            Sign Out
          </button>
        </>
      );
    }

    return (
      <>
        <Link href="/" className="mx-2">
          Home
        </Link>
        <Link href="/sign-in" className="mx-2">
          Sign In
        </Link>
        <Link href="/sign-up" className="mx-2">
          Sign Up
        </Link>
      </>
    );
  };

  return (
    <header className="w-full h-[8%] bg-orange-400 text-white flex items-center justify-between px-4">
      <div className="flex items-center">
        <span className="font-bold text-lg">Logo</span>
      </div>
      <nav className="flex items-center">{renderNavOptions()}</nav>
    </header>
  );
}

export default Header;
