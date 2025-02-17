"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityItem } from "./ActivityItem";
import { Plus } from "lucide-react";
import AddTasks from "./AddTasks";

export default function BuildingBlocks() {
  const [buildingBlocks, setBuildingBlocks] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [refreshData, setRefreshData] = useState(false);

  const togglePopup = () => {
    setPopupVisible((prev) => !prev);
    setRefreshData((prev) => !prev);
  };

  useEffect(() => {
    // Fetch building blocks
    const today = new Date().toISOString().split("T")[0];

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
  }, [refreshData]);

  return (
    <div>
      <div className="relative flex items-center justify-center mb-6">
  <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 text-center">
    Today&apos;s Building Blocks
  </h1>
  <button
    onClick={togglePopup}
    className="absolute right-0 bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700"
  >
    <Plus className="w-5 h-5" />
  </button>
  <AddTasks isOpen={isPopupVisible} onClose={togglePopup} />
</div>

      <div className="overflow-auto max-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg p-1 sm:p-4 bg-gray-50 dark:bg-gray-800">
        {buildingBlocks?.map((block) => (
          <ActivityItem key={block.id} className="mr-2" activity={block} reload={() => {setRefreshData((prev) => !prev) }} />
        ))}
      </div>
    </div>
  );
}
