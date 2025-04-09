"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { FiUserPlus } from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  LayoutDashboardIcon,
  BookIcon,
  ActivityIcon,
  EditIcon,
  LogOutIcon,
  User2,
  ChevronUp,
  Settings,
  LogInIcon,
  SidebarOpen,
  SidebarOpenIcon,
  PanelLeft,
  Brain,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import { IoToday, IoTodayOutline } from "react-icons/io5";

export function AppSidebar() {
  const { data, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  const NAV_OPTIONS = [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      isActive: status === "authenticated",
    },
    {
      name: "Today",
      url: "/today",
      icon: IoTodayOutline,
      isActive: status === "authenticated",
    },
    {
      name: "MindMap",
      url: "/mindmap",
      icon: Brain,
      isActive: status === "authenticated",
    },
    {
      name: "Activity",
      url: "/activity",
      icon: ActivityIcon,
      isActive: status === "authenticated",
    },
    {
      name: "Revision",
      url: "/revision",
      icon: EditIcon,
      isActive: status === "authenticated",
    },
    {
      name: "Subjects",
      url: "/subjects",
      icon: BookIcon,
      isActive: status === "authenticated",
    },
    {
      name: "Courses",
      url: "/courses",
      icon: BookIcon,
      isActive: status === "authenticated",
    },
    {
      name: "Topics",
      url: "/topics",
      icon: BookIcon,
      isActive: status === "authenticated",
    },
    {
      name: "Sub Topics",
      url: "/subTopics",
      icon: BookIcon,
      isActive: status === "authenticated",
    },
    {
      name: "Home",
      url: "/",
      icon: HomeIcon,
      isActive: status === "unauthenticated",
    },
    {
      name: "Sign In",
      url: "/sign-in",
      icon: LogInIcon,
      isActive: status === "unauthenticated",
    },
    {
      name: "Sign Up",
      url: "/sign-up",
      icon: FiUserPlus,
      isActive: status === "unauthenticated",
    },
  ];

  return (
    <Sidebar
      className="bg-slate-800 text-gray-200 flex flex-col overflow-hidden dark:bg-gray-900 dark:text-gray-200"
      collapsible="icon"
      default="collapsed"
    >
      {/* Sidebar Header */}
      <SidebarHeader className=" text-2xl font-bold text-black border-b dark:border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem className="w-full">
            <SidebarMenuButton className="w-full ">
              <PanelLeft
                onClick={() => toggleSidebar()}
                className="text-black dark:text-white"
              />

              <div className="flex items-center justify-around w-full">
                <span className="text-black text-xl dark:text-white">
                  ignify
                </span>
                <Link href="/">
                  <Image
                    src="/logo.jpeg"
                    alt="Logo"
                    width={30}
                    height={30}
                    className="rounded-full object-cover cursor-pointer transition duration-200 hover:scale-105 hover:shadow-md"
                  />
                </Link>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
        <SidebarMenu>
          {NAV_OPTIONS.filter((option) => option.isActive).map((option) => (
            <SidebarMenuItem key={option.name} title={option.name}>
              <SidebarMenuButton
                onClick={() => {
                  if (isMobile || open) {
                    toggleSidebar();
                  }
                  router.push(option.url);
                }}
                className={cn(
                  "flex items-center px-3 py-2 rounded transition-colors duration-200",
                  pathname.startsWith(option.url)
                    ? "bg-gray-800 text-white font-medium dark:bg-gray-700"
                    : "hover:bg-gray-500 text-black dark:hover:bg-gray-600 dark:text-gray-200"
                )}
              >
                {/* <Link
                  href={option.url}
                  className={cn(
                    "flex items-center px-3 py-2 rounded transition-colors duration-200",
                    pathname.startsWith(option.url)
                      ? "bg-gray-800 text-white font-medium dark:bg-gray-700"
                      : "hover:bg-gray-500 text-black dark:hover:bg-gray-600 dark:text-gray-200"
                  )}
                > */}
                <option.icon
                  className={cn(
                    "mr-3 w-5 h-5",
                    pathname.startsWith(option.url)
                      ? "text-white dark:text-gray-200"
                      : "text-black dark:text-gray-300"
                  )}
                />
                <span>{option.name}</span>
                {/* </Link> */}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Footer */}
      {data && (
        <SidebarFooter className="px-2 py-4 border-t dark:border-gray-700">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex items-center w-full text-black transition-colors duration-200 px-4 py-2 rounded-lg dark:text-gray-200 dark:hover:bg-gray-600">
                    <User2 className="text-gray-400 mr-3 w-5 h-5" />
                    <span>{data?.firstName + " " + data?.lastName}</span>
                    <ChevronUp className="ml-auto text-gray-500 w-4 h-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                {/* Dropdown Menu Content */}
                <DropdownMenuContent
                  side="top"
                  align="end"
                  className="mt-2 text-gray-300 shadow-lg rounded-md w-full overflow-hidden dark:bg-gray-800"
                >
                  <DropdownMenuItem className="hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 flex items-center">
                    <HomeIcon className="mr-3 w-5 h-5 text-gray-400" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 flex items-center">
                    <Settings className="mr-3 w-5 h-5 text-gray-400" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 px-4 py-2 flex items-center">
                    <button
                      onClick={() => signOut()}
                      className="flex items-center text-gray-300 hover:text-red-400 transition-colors duration-200 w-full"
                    >
                      <LogOutIcon className="mr-3 w-5 h-5 text-red-500" />
                      <span className="text-md">Logout</span>
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
