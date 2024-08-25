"use client";
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";

async function updateActivity(subtopicId, revisionId, status) {
  const response = await axios.patch("/api/updateRevision", {
    status,
    subtopicId,
    revisionId
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

export default function DataRow({ subtopic, subIndex, onsubtopicUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!subtopic.end);
  const [endDate, setEndDate] = useState(subtopic.end);

  return (
    <TableRow
      key={subIndex}
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
          disabled={updating}
          defaultChecked={!!endDate}
          onCheckedChange={async (status) => {
            setUpdating(true);
            const response = await updateActivity(
              subtopic.id,
              subtopic.revisionId,
              status
            );
            setUpdating(false);
            if (response.status === 200) {

              onsubtopicUpdate({
                ...subtopic,
                end: status ? new Date() : null,
              });
              setIsCompleted(status);
              setEndDate(status ? new Date() : null);
            }
          }}
        />
      </TableCell>
    </TableRow>
  );
}
