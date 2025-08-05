"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils"; // If you don't use this, replace with classnames directly
import Activity from "../activity/Activity";
import Revision from "../revision/Revision";
import Notes from "../notes/Notes";
import api from "@/axios";

const tabs = [
  { id: "activity", label: "Learn" },
  { id: "notes", label: "Make Notes" },
  { id: "revision", label: "Revise" },
];

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState("activity");
  const [counts, setCounts] = useState();

  const renderContent = () => {
    switch (activeTab) {
      case "activity":
        return (
          <Activity
            counts={counts?.filter((c) => c?.tableName === "activity")}
          />
        );
      case "notes":
        return (
          <Notes counts={counts?.filter((c) => c?.tableName === "notes")} />
        );
      case "revision":
        return (
          <Revision
            counts={counts?.filter((c) => c?.tableName === "revision")}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const getSubtopicsPendingCount = async () => {
      try {
        const { data } = await api.get("/getSubtopicsPendingCount");

        // console.log("All count", data);
        setCounts(data.data);
      } catch (error) {
        console.error(error);
      }
    };
    getSubtopicsPendingCount();
  }, []);

  return (
    <div className="relative w-full mx-auto  ">
      {/* Tabs */}
      <div className="w-1/3 absolute -top-6 left-4 flex justify-around space-x-3 bg-slate-800/80 dark:bg-slate-700/80 backdrop-blur rounded-full px-4 py-2 shadow-lg border border-slate-600 z-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-full transition-all duration-200 text-sm font-medium ",
              activeTab === tab.id
                ? "bg-white text-black dark:bg-slate-300 dark:text-slate-900 shadow"
                : "text-white hover:bg-slate-700 dark:hover:bg-slate-600"
            )}
          >
            {tab.label}

            {(() => {
              const count = counts?.find((c) => c?.tableName === tab.id);
              return count ? (
                <>
                  &nbsp;({count.completed}/{count.total})
                </>
              ) : null;
            })()}
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
