"use client";

import { confirmAction } from "@/components/ConfirmAction";
import { Crown, Music, RefreshCw, Trash, User, Zap } from "lucide-react";
import { useState } from "react";

function TaskItem({ task, onDelete, onUpdate }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const priorityColors = {
    High: "bg-red-500 text-white",
    Medium: "bg-orange-500 text-white",
    Low: "bg-blue-500 text-white",
  };

  const statusColors = {
    Completed: "bg-green-100 dark:bg-green-500",
    "In Progress": "bg-yellow-100 dark:bg-yellow-500",
    Pending: "bg-gray-100 dark:bg-gray-500",
  };

  const handleUpdateTask = async () => {
    setIsProcessing(true);
    try {
      const updatedTask = {
        ...task,
        status:
          task.status === "Pending"
            ? "In Progress"
            : task.status === "In Progress"
            ? "Completed"
            : "Pending",
      };

      const response = await fetch("/api/buildingBlocks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      onUpdate((await response.json()).data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTask = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/buildingBlocks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: task.id }),
      });
      onDelete(task);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (time, addMinutes = 0) => {
    let [hours, minutes, seconds] = time.split(":").map(Number);
    minutes += addMinutes;
    hours += Math.floor(minutes / 60);
    minutes = minutes % 60;
    let date = new Date();
    date.setHours(hours, minutes, seconds);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <li
      className={`flex flex-col md:flex-row justify-between relative p-5 rounded-lg shadow-md transition-all duration-300 pl-4 border-l-8 border-l-yellow-600 text-sm sm:text-base ${
        statusColors[task.status] || "bg-white dark:bg-gray-700"
      }`}
    >
      <div>
        {/* Start Time (Top Left) */}
        <span className="absolute top-0 left-0 text-sm p-1 bg-yellow-600 text-white rounded-br-xl">
          {formatTime(task.startTime)} ({task.duration} minutes)
        </span>

        {/* End Time (Bottom Left) */}
        <span className="absolute bottom-0 left-0 text-sm p-1 bg-yellow-600 text-white rounded-tr-xl ">
          {formatTime(task.startTime, task.duration)}
        </span>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center ">
          {/* Task Details */}
          <div className="flex flex-col flex-1 my-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              {task.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {task.description}
            </p>
            {task.recurringTaskId && (
              <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                <span className="mr-2">
                  Streak: {task.streak} {task.streak !== 0 ? "🔥" : ""}
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row  items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-0 mr-6">
              {task.streak > 0 &&
                (task.streak <= 7 ? (
                  <span className="bg-green-200 dark:bg-green-400 text-green-800 dark:text-green-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                    <Zap className="w-5 h-5 mr-2 text-green-600 dark:text-green-200" />
                    Spark Phase
                    <span className="ml-1 font-normal text-xs bg-green-300 text-green-900 dark:bg-green-500 dark:text-green-100 px-2 py-0.5 rounded-full">
                      Days 1-7
                    </span>
                  </span>
                ) : task.streak <= 28 ? (
                  <span className="bg-blue-200 dark:bg-blue-400 text-blue-800 dark:text-blue-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                    <RefreshCw className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-200" />
                    Momentum Phase
                    <span className="ml-1 font-normal text-xs bg-blue-300 text-blue-900 dark:bg-blue-500 dark:text-blue-100 px-2 py-0.5 rounded-full">
                      Week 2-4
                    </span>
                  </span>
                ) : task.streak <= 90 ? (
                  <span className="bg-purple-200 dark:bg-purple-400 text-purple-800 dark:text-purple-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                    <Music className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-200" />
                    Rhythm Phase
                    <span className="ml-1 font-normal text-xs bg-purple-300 text-purple-900 dark:bg-purple-500 dark:text-purple-100 px-2 py-0.5 rounded-full">
                      Month 2-3
                    </span>
                  </span>
                ) : task.streak <= 180 ? (
                  <span className="bg-yellow-200 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                    <User className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-200" />
                    Identity Phase
                    <span className="ml-1 font-normal text-xs bg-yellow-300 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-100 px-2 py-0.5 rounded-full">
                      Month 4-6
                    </span>
                  </span>
                ) : (
                  <span className="bg-red-200 dark:bg-red-400 text-red-800 dark:text-red-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                    <Crown className="w-5 h-5 mr-2 text-red-600 dark:text-red-200" />
                    Mastery Phase
                    <span className="ml-1 font-normal text-xs bg-red-300 text-red-900 dark:bg-red-500 dark:text-red-100 px-2 py-0.5 rounded-full">
                      6+ Months
                    </span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center md: gap-3 ">
        <button
          className={`px-4 py-2 rounded-lg text-white ${
            priorityColors[task.priority] || "bg-gray-800"
          }`}
        >
          {task.priority} Priority
        </button>
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          onClick={handleUpdateTask}
        >
          {task.status}
        </button>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={async () => {
            const confirmation = await confirmAction({
              title: "Confirm Deletion",
              message: "Are you sure you want to delete this task?",
            });

            if (confirmation) {
              handleDeleteTask();
            }
          }}
        >
          <Trash size={16} />
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
