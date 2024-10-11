"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CircleUser, Menu } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";

// Reusable Button Component
const Button = ({ href, onClick, children, className }) => {
  const classes = clsx(
    "px-4 py-2 rounded-md transition-colors duration-300 shadow-sm hover:shadow-md",
    className
  );

  return href ? (
    <Link href={href} className={classes} onClick={onClick}>
      {children}
    </Link>
  ) : (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
};

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const NAV_OPTIONS = [
    {
      name: "Dashboard",
      url: "/dashboard",
      isActive: status === "authenticated",
      onNavbar: true,
    },
    {
      name: "Activity",
      url: "/activity",
      isActive: status === "authenticated",
      onNavbar: true,
    },
    {
      name: "Revision",
      url: "/revision",
      isActive: status === "authenticated",
      onNavbar: true,
    },
    {
      name: "Add Subject",
      url: "/create-subject",
      isActive: status === "authenticated",
      onNavbar: false,
    },
    {
      name: "Subjects",
      url: "/subjects",
      isActive: status === "authenticated",
      onNavbar: false ,
    },
    {
      name: "Courses",
      url: "/courses",
      isActive: status === "authenticated",
      onNavbar: false,
    },
    {
      name: "Topics",
      url: "/topics",
      isActive: status === "authenticated",
      onNavbar: false,
    },
    {
      name: "Sub Topics",
      url: "/subTopics",
      isActive: status === "authenticated",
      onNavbar: false,
    },
    {
      name: "Home",
      url: "/",
      isActive: status === "unauthenticated",
      onNavbar: true,
    },
    {
      name: "SignIn",
      url: "/sign-in",
      isActive: status === "unauthenticated",
      onNavbar: true,
    },
    {
      name: "SignUp",
      url: "/sign-up",
      isActive: status === "unauthenticated",
      onNavbar: true,
    },
  ];

  return (
    <header className="w-full h-16 bg-indigo-600 text-white flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 shadow-lg fixed top-0 left-0 z-50">
      <div className="flex items-center">
        <span className="font-bold text-xl sm:text-2xl lg:text-3xl">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={50}
            height={50}
            className="h-10 w-10 object-contain rounded-full cursor-pointer"
            onClick={() => {
              if (status === "authenticated") {
                router.push("/dashboard");
              } else {
                router.push("/");
              }
            }}
          />
        </span>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
        {status === "loading" && (
          <div className="animate-pulse flex items-center space-x-4">
            <Skeleton className="h-8 w-24 rounded-md bg-gray-300 hidden md:block" />
            <Skeleton className="h-8 w-24 rounded-md bg-gray-300 hidden md:block" />
            <Skeleton className="h-8 w-24 rounded-md bg-gray-300 hidden md:block" />
            <Skeleton className="h-10 w-10 rounded-full bg-gray-300" />
          </div>
        )}
        {status !== "loading" && (
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6 lg:space-x-8">
            {NAV_OPTIONS.filter(
              (option) => option.isActive && option.onNavbar
            ).map((option) => (
              <Button
                key={option.name}
                href={option.url}
                className={clsx(
                  pathname === option.url ? "bg-green-500 font-bold" : "",
                  "bg-blue-500 hover:bg-blue-600 text-xs sm:text-sm md:text-base lg:text-lg rounded-md hidden md:flex"
                )}
              >
                {option.name}
              </Button>
            ))}

            {/* {NAV_OPTIONS.filter(
              (option) => option.url === pathname
            ).map((option) => (
              <Button
                key={option.name}
                href={option.url}
                className={clsx(
                  pathname === option.url
                    ? "bg-green-500 font-bold"
                    : "bg-blue-500 hover:bg-blue-600",
                  " sm:text-sm text-base  rounded-md flex md:hidden"
                )}
              >
                {option.name}
              </Button>
            ))} */}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger>
                {status === "authenticated" ? (
                  <CircleUser
                    className="h-10 w-10 text-white cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  />
                ) : (
                  <Menu
                    className="h-6 w-6 text-white cursor-pointer"
                    onClick={() => setIsOpen(true)}
                  />
                )}
              </SheetTrigger>
              <SheetContent className="w-[17rem] sm:w-[18rem] md:w-[20rem] lg:w-[22rem] xl:w-[24rem] bg-white text-black">
                <SheetHeader className="flex items-center justify-between border-b border-gray-200 p-4">
                  <SheetTitle className="text-lg font-semibold">
                    {status === "authenticated"
                      ? `Welcome, ${data.firstName}`
                      : `Welcome`}
                  </SheetTitle>
                </SheetHeader>
                <SheetDescription className="flex flex-col space-y-2 p-4 px-0 h-full">
                  {NAV_OPTIONS.filter((option) => option.isActive).map(
                    (option) => (
                      <Button
                        key={option.name}
                        href={option.url}
                        onClick={() => setIsOpen(false)}
                        className={clsx(
                          pathname === option.url
                            ? "bg-green-500 font-bold"
                            : "",
                          "bg-blue-500 hover:bg-blue-600 text-base md:text-base lg:text-lg rounded-md text-black"
                        )}
                      >
                        {option.name}
                      </Button>
                    )
                  )}

                  {status === "authenticated" && (
                    <Button
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="bg-red-500 hover:bg-red-600 text-sm md:text-base lg:text-lg rounded-md text-black"
                    >
                      Sign Out
                    </Button>
                  )}
                </SheetDescription>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
