"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils"; // If you don't use this, replace with classnames directly
import Activity from "../activity/Activity";
import Revision from "../revision/Revision";
import Notes from "../notes/Notes";

const tabs = [
  { id: "Learn", label: "Learn" },
  { id: "Make Notes", label: "Make Notes" },
  { id: "Revise", label: "Revise" },
];

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState("Learn");

  const renderContent = () => {
    switch (activeTab) {
      case "Learn":
        return <Activity />;
      case "Make Notes":
        return <Notes  />;
      case "Revise":
        return <Revision/>;
      default:
        return null;
    }
  };

  return (
      <div className="relative w-full mx-auto  ">
      {/* Tabs */}
      <div className="w-1/3 absolute -top-6 left-4 flex justify-around space-x-3 bg-slate-800/80 dark:bg-slate-700/80 backdrop-blur rounded-full px-4 py-2 shadow-lg border border-slate-600 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-full transition-all duration-200 text-sm font-medium",
              activeTab === tab.id
                ? "bg-white text-black dark:bg-slate-300 dark:text-slate-900 shadow"
                : "text-white hover:bg-slate-700 dark:hover:bg-slate-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-10 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-300 dark:border-slate-700 p-6 text-slate-800 dark:text-slate-200 transition-all duration-300">
        {renderContent()}
      </div>
    </div>
  );
}
