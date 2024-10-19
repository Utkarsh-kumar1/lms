"use client";
import { useEffect, useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CreateActivity } from "@/actions/CreateActivity";

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
  const [endDate, setEndDate] = useState(subtopic.activityEnd);
  const router = useRouter();

  const handleCreateActivity  = async ()  => {

    const { error, success } = await CreateActivity(subtopic.subtopicId, subtopic.courseSession);

  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isCompleted !== !!subtopic.activityEnd) {
        setIsUpdating(true);
        axios
          .patch("/api/updateActivity", {
            status: isCompleted,
            activityId: subtopic.activityId,
            subtopicId: subtopic.subtopicId,
          })
          .then((result) => {
            setIsUpdating(false);
            router.refresh(); // Or trigger state update to re-render
          })
          .catch((err) => {
            setIsCompleted(!!subtopic.activityEnd);
            setEndDate(subtopic.activityEnd);
            setIsUpdating(false);
          });
      }
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [
    isCompleted,
    subtopic.activityEnd,
    subtopic.id,
    subtopic.revisionId,
    router,
    subtopic.activityId,
  ]);

  const handleChange = async (status) => {
    if (!isUpdating) {
      setIsCompleted(status);
      if (status) {
        setEndDate(subtopic.activityEnd || new Date());
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
          {subtopic.subTopicIndex + ". " + subtopic.subtopicName}
        </TableCell>
        <TableCell className="p-2 text-[.7rem] sm:text-base">
          {subtopic.activityStart ? (
            formatDate(subtopic.activityStart)
          ) : (
              <button className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 active:bg-blue-700"
              onClick={handleCreateActivity}>
              Create
            </button>
          )}
        </TableCell>
        <TableCell className="p-2 text-[.7rem] sm:text-base">
          {isCompleted ? formatDate(endDate) : "-"}
        </TableCell>
        <TableCell className="p-2 text-[.7rem] sm:text-base">
          <Switch
            className="bg-slate-50"
            disabled={isUpdating || subtopic.activityStart == null}
            onCheckedChange={handleChange}
            checked={isCompleted}
          />
        </TableCell>
      </TableRow>
    </>
  );
}
