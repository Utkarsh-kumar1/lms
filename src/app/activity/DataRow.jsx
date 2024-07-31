"use client";
import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";

async function updateActivity(id, status) {
  const response = await axios.patch("/api/updateActivity", {
    status,
    id,
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

export default function DataRow({ subtopic, subIndex }) {
    const [updating, setUpdating] = useState(false)
    const [isCompleted, setisCompleted] = useState(false)
    const [EndDate, setEndDate] = useState(subtopic.end)
    
      return (
        <TableRow
          key={subIndex}
          className={`${
            subtopic.end || isCompleted ? "bg-green-100" : "bg-red-100"
          } hover:bg-gray-200 transition duration-150`}
        >
          <TableCell className="p-2">{subtopic.subtopicName}</TableCell>
          <TableCell className="p-2">{formatDate(subtopic.start)}</TableCell>
          <TableCell className="p-2">
            {EndDate ? formatDate(EndDate) : "-"}
          </TableCell>
          <TableCell className="p-2">
            
            <Switch
              className={`bg-slate-50`}
              disabled={updating}
              defaultChecked={!!subtopic.end}
              onCheckedChange={async (status) => {
                setUpdating(true);
                const response = await updateActivity(subtopic.id, status);
                setUpdating(false);
                if (response.status == 200) {
                    setisCompleted(status)
                    if(status)
                    {
                      setEndDate(new Date())
                    }
                    else{
                      setEndDate(null)
                    }
                    
                }
              }}
            />
          </TableCell>
        </TableRow>
      );
}
