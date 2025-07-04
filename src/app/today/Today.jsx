"use client";

import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import api from "@/axios";

function Today() {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  function formatDateToLocalIST(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

  useEffect(() => {
    const date = formatDateToLocalIST(selectedDate);
    console.log(date);

    const fetchBuildingBlocks = async () => {
      try {
        const data = await api.get("/tasks", {
          params: { today: date },
        });
        // const data = await response.json()
        setTasks(data.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBuildingBlocks();
  }, [selectedDate]);
  // console.log(token.id);

  return (
    <div className="w-full h-full rounded-md p-4">
      {/* Header */}
      {/* Tasks Section */}
      <TaskList
        initialTasks={tasks}
        changeDate={(newDate) => setSelectedDate(newDate)}
      />
      
    </div>
  );
}

export default Today;
