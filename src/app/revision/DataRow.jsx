"use client";

import React, { useEffect, useState } from "react";
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
  const [isCompleted, setIsCompleted] = useState(!!subtopic.end);
  const [endDate, setEndDate] = useState(subtopic.end);
  const router = useRouter();

  useEffect(() => {
    
    const handler = setTimeout(() => {
      if (isCompleted !== !!subtopic.end) {
        setIsUpdating(true);
        axios
          .patch("/api/updateRevision", {
            status: isCompleted,
            subtopicId: subtopic.id,
            revisionId: subtopic.revisionId,
          })
          .then((result) => {
            setIsUpdating(false);
            router.refresh(); // Or trigger state update to re-render
          })
          .catch((err) => {
            setIsCompleted(!!subtopic.end);
            setEndDate(isCompleted ? new Date() : null);
            setIsUpdating(false);
          });
      }
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [isCompleted, subtopic.end, subtopic.id, subtopic.revisionId, router]);

  const handleChange = async (status) => {
    if (!isUpdating) {
      setIsCompleted(status);
      if (status) {
        setEndDate(subtopic.end || new Date());
      } else {
        setEndDate(null);
      }
    }
  };

  return (
    <TableRow
      className={`${
        endDate || isCompleted ? "bg-green-100" : "bg-red-100"
      } hover:bg-gray-200 transition duration-150 sm:text-sm`}
    >
      <TableCell className="p-2 text-[.7rem] sm:text-base">
        {subtopic.subtopicName}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base">
        {formatDate(subtopic.start)}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base">
        {endDate ? formatDate(endDate) : "-"}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base">
        {subtopic.revisionCounter}
      </TableCell>
      <TableCell className="p-2 text-[.7rem] sm:text-base">
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
