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
import { AddOrUpdateTasks } from "@/actions/AddOrUpdateTasks";
import axios from "axios";
import { useSession } from "next-auth/react";

function Header() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [task, setTask] = useState("");
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const [refreshData, setRefreshData] = useState(false);
  const [todos, setTodos] = useState([]);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [showList, setShowList] = useState(false);
  const { data, status } = useSession();

  // Ensures the component is mounted before rendering theme-dependent content
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (status === "authenticated") {
      // Fetch building blocks
      const today = "todo";

      const fetchToDos = async () => {
        try {
          const { data } = await axios.get("/api/buildingBlocks", {
            params: { today },
          });
          // const data = await response.json()
          setTodos(data.data);
          console.log("Data", data.data);
        } catch (error) {
          console.error(error);
        }
      };
      fetchToDos();
    }
  }, [refreshData, status]);

  const paths = decodeURI(pathname).split("/");

  // Function to start/reset the timer (only when task is empty & input is not focused)
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (task.trim() === "" && document.activeElement !== inputRef.current) {
      timerRef.current = setTimeout(() => {
        setShowInput(false); // Close input after 10 seconds of inactivity
      }, 10000);
    }
  };

  // Start timer when input appears, reset it on input change
  useEffect(() => {
    if (showInput) {
      resetTimer(); // Only start timer when the input is shown
    }
    return () => clearTimeout(timerRef.current);
  }, [showInput, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Task Submitted:", task);
    const title = task;

    const { success, error } = await AddOrUpdateTasks({ title });
    console.log(success, error);
    if (success) {
      setRefreshData(!refreshData);
    }
    setTask(""); // Clear input after submission
    setShowInput(false); // Hide input after submission
  };

  const deleteTodo = async (id) => {
    console.log("Deleting task with id:", id);
    try {
      const response = await axios.delete("/api/buildingBlocks", {
        data: { id },
      });
      console.log("Deleted successfully:", response.data);
      setRefreshData(!refreshData);
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  // Flip title every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % todos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [todos]);

  // Handle click to toggle the scrollable list
  const handleTitleClick = () => {
    setShowList(!showList);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const options = { month: "short", day: "numeric" };
    if (date.getFullYear() !== now.getFullYear()) {
      options.year = "numeric";
    }

    const formattedDate = date.toLocaleDateString("en-US", options);
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { formattedDate, formattedTime };
  };

  const showTodo = todos?.length > 0 && (
    <div className="relative">
      {/* Title Button with Animated Width */}
      <div
        className="flex items-center justify-center cursor-pointer select-none bg-orange-200 hover:bg-orange-300 hover:text-gray-800 shadow-md rounded-lg p-2 focus:ring-2 focus:ring-orange-300 transition-all duration-300 ease-in-out"
        onClick={handleTitleClick}
      >
        <span className="inline-block transition-all duration-300 ease-in-out">
          {todos[currentTitleIndex]?.title}
        </span>
      </div>

      {/* Task List (Fixed Width) */}
      {showList && (
        <div className="absolute top-full right-0 bg-white p-4 shadow-lg w-64 h-48 overflow-y-auto border mt-2 rounded-lg">
          <ul className="divide-y-4 divide-gray-200">
            {todos.map((item) => {
              const { formattedDate, formattedTime } = formatDate(
                item?.createdAt
              );
              return (
                <li
                  key={item?.id}
                  className="p-3 text-sm text-gray-700 flex flex-col"
                >
                  {/* Task Title */}
                  <span className="font-semibold">{item?.title}</span>

                  {/* Date & Time */}
                  <div className="text-xs text-gray-500 mt-1 flex justify-between items-center border-t pt-2">
                    <span>{formattedDate}</span>
                    <Trash2
                      onClick={() => {
                        deleteTodo(item?.id);
                      }}
                      className="w-3 h-3 text-red-500 cursor-pointer"
                    />
                    <span>{formattedTime}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  )

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

      {/* Todo show only for tablet and laptop screen */}
      <div className="absolute top-full right-4 shadow-lg rounded-lg md:static">{showTodo}</div>
      
      
      {status === "authenticated" && (
        <div className="relative">
          {/* Clickable ToDo Button with animation */}
          <div
            className="flex items-center justify-center mr-6 cursor-pointer select-none  bg-orange-200 hover:bg-orange-300 hover:text-gray-800 shadow-md rounded-lg p-1 focus:ring-2 focus:ring-orange-300 hover:scale-105"
            onClick={() => setShowInput(!showInput)}
            aria-label="Toggle ToDo Input"
          >
            <span className="mr-2 dark:text-slate-400 ">ToDo</span>
            <ClipboardList className="p-0.5 transform transition-transform duration-300 ease-in-out hover:scale-110 dark:text-slate-400" />
          </div>

          {/* Floating Input Field & Submit Button with animation */}
          {showInput && (
            <form
              onSubmit={handleSubmit}
              className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border shadow-lg rounded-lg p-4 z-50 w-64 transition-all duration-500 dark:bg-slate-700 ${
                showInput ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 transition-all duration-200 ease-in-out"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter task..."
                onBlur={resetTimer} // Restart timer if input loses focus
                onFocus={() => clearTimeout(timerRef.current)} // Stop timer when input is focused
              />
              <button
                type="submit"
                className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Submit
              </button>
            </form>
          )}
        </div>
      )}

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
