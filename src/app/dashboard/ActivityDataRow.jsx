"use client";
import React, { useState, useEffect } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";

async function updateDailyActivity(id, status) {
  const response = await axios.patch(
    "/api/dailyActivities/updateDailyActivities",
    {
      status,
      id,
    }
  );
  return response;
}

export default function ActivityDataRow({ activity }) {
  
  const [updating, setUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(activity.isCompleted);
  const [streak, setStreak] = useState(activity.streak);

  // Update isCompleted and streak state when the activity prop changes
  useEffect(() => {
    setIsCompleted(activity.isCompleted);
    setStreak(activity.streak);
  }, [activity]);
  

  return (
    <TableRow
      className={`${
        isCompleted ? "bg-green-100" : "bg-red-100"
      } hover:bg-gray-200 transition duration-150 sm:text-sm rounded-xl`}
    >
      <TableCell className="p-2 text-[.7rem] sm:text-base">
        {activity.task}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base">
        {isCompleted ? "Completed" : "Not Completed"}
      </TableCell>
      <TableCell className="relative">
        {streak}{ activity.isBestStreak &&
         <span className="absolute text-[10px] top-0 align-super bg-gradient-to-bl bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent font-black italic">Best</span>}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base">
        <Switch
          className={`bg-slate-50`}
          disabled={updating || activity.startDate == new Date().getDate() }
          checked={isCompleted}
          onCheckedChange={async (status) => {
            setUpdating(true);
            const response = await updateDailyActivity(activity.id, status);
            setUpdating(false);
            if (response.status === 200) {
              setIsCompleted(status);
              console.log(isCompleted);
              if (!isCompleted ) setStreak(streak+1);
              else setStreak(streak-1);
            }
          }}
        />
      </TableCell>
    </TableRow>
  );
}
