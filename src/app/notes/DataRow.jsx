"use client";

import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import api from "@/axios";

function formatDate(inputDate) {
  const dateObj = new Date(inputDate);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
} 

export default function DataRow({ subtopic }) {
  console.log("subtopic", subtopic);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!subtopic?.end);
  const router = useRouter();

  const handleChange = (status) => {
    setIsUpdating(true);

    api
          .patch(`/updateRevision/${subtopic.id}`, {
            status: status,
          })
          .then((result) => {
            setIsUpdating(false);
            setIsCompleted(status)
            router.refresh(); // Or trigger state update to re-render
          })
          .catch((err) => {
            setIsCompleted(!!subtopic.activityEnd);
            setIsUpdating(false);
          });
    
    // axios
    //   .patch("/api/updateRevision", {
    //     status,
    //     subtopicId: subtopic.id,
    //     revisionId: subtopic.revisions[0].id,
    //   })
    //   .then((result) => {
    //     setIsUpdating(false);
    //     setIsCompleted(status);
    //     router.refresh(); // Or trigger state update to re-render
    //   })
    //   .catch((err) => {
    //     setIsUpdating(false);
    //   });
  };

  return (
    <TableRow
      className={`${
        isCompleted ? "bg-green-100 dark:bg-green-900" : ""
      }  transition duration-150 sm:text-sm`}
    >
      <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-gray-200">
        {subtopic.subtopicIndex + ". " + subtopic.subtopicName}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-gray-200">
        {formatDate(subtopic?.start)}
      </TableCell>
      {/* <TableCell className="p-2 text-[.7rem] sm:text-base text-center dark:text-gray-200">
        {subtopic?.revisionCounter}
      </TableCell> */}
      <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-gray-200">
        {isUpdating ? (
          <Loader2Icon className=" animate-spin h-7 " />
        ) : (
          <Switch
            className="bg-slate-50"
            disabled={isUpdating}
            checked={isCompleted}
            onCheckedChange={handleChange}
          />
        )}
      </TableCell>
    </TableRow>
  );
}
