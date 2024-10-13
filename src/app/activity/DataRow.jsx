"use client";
import { useEffect, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!subtopic.end);
  const [endDate, setEndDate] = useState(subtopic.end);
  const router = useRouter();

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isCompleted !== !!subtopic.end) {
        setIsUpdating(true);
        axios
          .patch("/api/updateActivity", {
            status: isCompleted,
            activityId: subtopic.activityId,
            subtopicId: subtopic.id,
          })
          .then((result) => {
            setIsUpdating(false);
            router.refresh(); // Or trigger state update to re-render
          })
          .catch((err) => {
            setIsCompleted(!!subtopic.end);
            setEndDate(subtopic.end);
            setIsUpdating(false);
          });
      }
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [
    isCompleted,
    subtopic.end,
    subtopic.id,
    subtopic.revisionId,
    router,
    subtopic.activityId,
  ]);

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
    <>
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
          {isCompleted ? formatDate(endDate) : "-"}
        </TableCell>
        <TableCell className="p-2 text-[.7rem] sm:text-base">
          <Switch
            className="bg-slate-50"
            disabled={isUpdating}
            onCheckedChange={handleChange}
            checked={isCompleted}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
