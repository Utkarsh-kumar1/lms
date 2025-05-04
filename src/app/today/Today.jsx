"use client";

import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import axios from "axios";
import CalendarView from "@/components/CalendarView";

function Today({ token}) {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    // Fetch building blocks
    const date = selectedDate.toISOString().split("T")[0];

    const fetchBuildingBlocks = async () => {
      try {
        const { data } = await axios.get("/api/buildingBlocks", {
          params: { date },
        });
        // const data = await response.json()
        setTasks(data.data);
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
