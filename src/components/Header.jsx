"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  Moon,
  Plus,
  Sun,
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";

function Header() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensures the component is mounted before rendering theme-dependent content
  useEffect(() => setMounted(true), []);

  const paths = decodeURI(pathname).split("/");

  return (
    <header className="min-h-12 sticky top-0 bg-white/30 backdrop-blur-md flex items-center justify-between px-4 shadow-sm z-50 dark:bg-transparent gap-3">
      {/* Sidebar Trigger */}
      <div>
        {isMobile && (
          <SidebarTrigger className="text-black hover:text-gray-600 transition duration-200 dark:text-white dark:hover:text-gray-400" />
        )}
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1 mr-auto overflow-hidden">
        {paths
          .filter((value, index) => index < 2)
          .map((path, index) => (
            <span className="flex items-center" key={index}>
              <span
                title={path}
                className="capitalize font-medium text-sm sm:text-base truncate max-w-[100px] sm:max-w-[400px] lg:max-w-full overflow-hidden whitespace-nowrap dark:text-white"
              >
                {path}
              </span>
              {index < paths?.length - 1 && (
                <ChevronRight className="text-gray-600 dark:text-gray-400" />
              )}
            </span>
          ))}
      </nav>

      <div>
        {/* Only render theme icon if component is mounted */}
        {mounted &&
          (theme === "dark" ? (
            <Sun onClick={() => setTheme("light")} />
          ) : (
            <Moon onClick={() => setTheme("dark")} />
          ))}
      </div>

      {/* Logo */}
      <div>
        <Link href="/">
          <Image
            src="/logo.jpeg"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-full object-cover cursor-pointer transition duration-200 hover:scale-105 hover:shadow-md"
          />
        </Link>
      </div>
    </header>
  );
}

export default Header;