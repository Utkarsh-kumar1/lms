"use client";
import React from "react";

import ChartLine from "./ChartLine";
import Quotes from "./Quotes";
import BuildingBlocks from "./BuildingBlocks";

export default function Dashboard({ userData }) {
  return (
    <div className="flex flex-col w-full p-2 sm:p-6 bg-gray-100 dark:bg-gray-800 min-h-screen gap-6">

      <div className=" dark:bg-gray-900  text-2xl shadow-md rounded-lg p-3 text-back sm:p-6 ">
        <Quotes quote={userData?.quote?.[0]} />
      </div>

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-3 sm:p-6">
        <BuildingBlocks />
      </div>
      
      {/* <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-3 sm:p-6">
        <MicroPlanner userData={userData.microPlannerTasks} />
      </div> */}

      <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg min-h-[30rem]">
        <div className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-4 mx-auto text-center">
          Weekly Progress Tracker
        </div>
        <ChartLine className="h-[30rem]" data={userData.chartLineData} />
      </div>

      {/* <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-3 sm:p-6">
        <DailyActivities userData={userData} />
      </div> */}

    </div>
  );
}
