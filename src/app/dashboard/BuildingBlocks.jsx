"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityItem } from "./ActivityItem";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import AddTasks from "./AddTasks";

export default function BuildingBlocks() {
  const [buildingBlocks, setBuildingBlocks] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [date, setDate] = useState(new Date());

  const changeDate = (days) => {
    setDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const togglePopup = () => {
    setPopupVisible((prev) => !prev);
    setRefreshData((prev) => !prev);
  };

  useEffect(() => {
    // Fetch building blocks
    const today = date.toISOString().split("T")[0];

    const fetchBuildingBlocks = async () => {
      try {
        const { data } = await axios.get("/api/buildingBlocks", {
          params: { today },
        });
        // const data = await response.json()
        setBuildingBlocks(data.data);
        // console.log("Data", data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBuildingBlocks();
  }, [refreshData, date]);

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

  const isToday = () => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  return (
    <div>
      <AddTasks isOpen={isPopupVisible} onClose={togglePopup} />
      <div className="relative flex items-center justify-center mb-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center">
          Building Blocks
        </h1>
      </div>

      <div className="flex items-center justify-between space-x-4 pb-4 rounded-lg">
        <div className="flex items-center justify-between space-x-4">
          {/* Left Arrow */}
          <button
            onClick={() => changeDate(-1)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <ChevronLeft />
          </button>

          {/* Date in Center */}
          <span className="text-lg font-semibold">
            {formatDate(date).formattedDate}
          </span>

          {/* Right Arrow */}
          <button
            onClick={() => changeDate(1)}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <ChevronRight />
          </button>

          {/* Go to Today Button */}
          {!isToday() && (
            <button
              onClick={() => setDate(new Date())}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
            >
              Go to Today
            </button>
          )}
        </div>

        {/* Plus Button (End) */}
        <button
          onClick={togglePopup}
          className="bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-auto max-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg p-1 sm:p-4 bg-gray-50 dark:bg-gray-800">
        {buildingBlocks?.map((block) => (
          <ActivityItem
            key={block.id}
            className="mr-2"
            activity={block}
            reload={() => {
              setRefreshData((prev) => !prev);
            }}
          />
        ))}
      </div>
    </div>
  );
}
