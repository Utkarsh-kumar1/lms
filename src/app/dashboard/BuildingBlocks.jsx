"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityItem } from "./ActivityItem";
import { Plus } from "lucide-react";
import AddTasks from "./AddTasks";

export default function BuildingBlocks() {
  const [buildingBlocks, setBuildingBlocks] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const togglePopup = () => {
    setPopupVisible((prev) => !prev);
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
        console.log("Data", data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBuildingBlocks();
  }, []);

  // useEffect(() => {
  //   console.log(popUp);
  // }, [popUp])

  return (
    <div>
      <div className="flex ">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
          Today&apos;s Building Blocks
        </h1>
        <Plus className="w-5 h-5 cursor-pointer" onClick={togglePopup} />
        <AddTasks isOpen={isPopupVisible} onClose={togglePopup} />
      </div>
      <div className="overflow-auto max-h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg p-1 sm:p-4 bg-gray-50 dark:bg-gray-800">
        {buildingBlocks?.map((block) => (
          <ActivityItem key={block.id} className="mr-2" activity={block} />
        ))}
      </div>
    </div>
  );
}
