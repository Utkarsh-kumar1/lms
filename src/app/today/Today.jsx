"use client";

import { useEffect, useState } from "react";
import TaskList from "./TaskList";
import api from "@/axios";

function Today() {
  
  // console.log(token.id);

  return (
    <div className="w-full h-full rounded-md p-4">
      {/* Header */}
      {/* Tasks Section */}
      <TaskList
        // initialTasks={tasks}
        // changeDate={(newDate) => setSelectedDate(newDate)}
      />
      
    </div>
  );
}

export default Today;
