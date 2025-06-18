"use client";
import { useEffect, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { Loader2Icon, LoaderCircle, LucideLoaderCircle } from "lucide-react";
import api from "@/axios";
import Loader from "@/components/Loader";

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
  const [isCompleted, setIsCompleted] = useState(!!subtopic.activityEnd);
  const router = useRouter();

  const handleCreateActivity = async () => {
    await api.post(`/createActivity`, {
      subtopicId: subtopic.subtopicId,
      subtopicSession: subtopic.courseSession
    })
    
  };

  const handleChange = (status) => {
    setIsUpdating(true);
    console.log("Updating status to:", status);
    api
      .patch(`/updateActivity/${subtopic.activityId}`, {
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
  };

  return (
    <>
      <TableRow
        key={subIndex}
        className={` dark:text-white ${
          isCompleted ? "bg-green-100 dark:bg-green-900" : ""
        }  transition duration-150 sm:text-sm `}
      >
        <TableCell className="p-2 text-[.7rem] sm:text-base dark:text-white">
          {subtopic.subTopicIndex + ". " + subtopic.subtopicName}
        </TableCell>
        <TableCell className="p-2 text-[.7rem] sm:text-base">
          {subtopic.activityStart ? (
            formatDate(subtopic.activityStart)
          ) : (
            <button
              className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 active:bg-blue-700"
              onClick={handleCreateActivity}
            >
              Add
            </button>
          )}
        </TableCell>
        <TableCell className="p-2 text-[.7rem] sm:text-base ">
          {isUpdating ? (
            <Loader2Icon className=" animate-spin h-7 " />
          ) : (
            <Switch
              className="bg-slate-50"
              disabled={isUpdating || subtopic.activityStart == null}
              onCheckedChange={handleChange}
              checked={isCompleted}
            />
          )}
        </TableCell>
      </TableRow>
    </>
  );
}
