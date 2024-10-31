"use client";

import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useRouter } from "next/navigation";

async function updateActivity(subtopicId, revisionId, status) {
  const response = await axios.patch("/api/updateRevision", {
    status,
    subtopicId,
    revisionId,
  });
  return response;
}

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!subtopic.revisions[0]?.end);
  const [endDate, setEndDate] = useState(subtopic.revisions[0]?.end);
  const router = useRouter();

  const handleChange = async (status) => {
    if (!isUpdating) {
      setIsUpdating(true);
      setIsCompleted(status);
      if (status) {
        setEndDate(subtopic.end || new Date());
      } else {
        setEndDate(null);
      }

      try {
        await updateActivity(subtopic.id, subtopic.revisions[0].id, status);
        setIsUpdating(false);
        router.refresh(); // Or trigger state update to re-render
      } catch (error) {
        setIsCompleted(!!subtopic.end);
        setEndDate(isCompleted ? new Date() : null);
        setIsUpdating(false);
      }
    }
  };

  return (
    <TableRow
      className={`${
        endDate || isCompleted ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-rose-500"
      } hover:bg-gray-200 transition duration-150 sm:text-sm`}
    >
      <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-gray-200">
        {subtopic.subTopicIndex + ". " + subtopic.subtopicName}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-gray-200">
        {formatDate(subtopic.revisions[0]?.start)}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-gray-200">
        {endDate ? formatDate(endDate) : "-"}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base text-center dark:text-gray-200">
        {subtopic.revisions[0]?.revisionCounter}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-gray-200">
        <Switch
          className="bg-slate-50"
          disabled={isUpdating}
          checked={isCompleted}
          onCheckedChange={handleChange}
        />
      </TableCell>
    </TableRow>
  );
}
