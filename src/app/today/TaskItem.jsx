"use client";

import { confirmAction } from "@/components/ConfirmAction";
import { Crown, Music, RefreshCw, Trash, User, Zap } from "lucide-react";
import { useState } from "react";
import {
  FaHourglassStart,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import api from "../../axios";

function TaskItem({ task, onDelete, onUpdate }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newStartTime, setNewStartTime] = useState(task.startTime);
  const [newDuration, setNewDuration] = useState(task.duration);
  const [timer, setTimer] = useState(null);
  const [isLongPress, setIsLongPress] = useState(false);

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

  const getTextColor = (bgColor) => bgColor?.replace(/bg-/g, "text-");

  const handleMouseDown = () => {
    setIsLongPress(false);
    const newTimer = setTimeout(() => {
      setIsLongPress(true);
      handleUpdateTask({ editingField: "status" });
    }, 1200); // 1.2 second hold
    setTimer(newTimer);
  };

  const handleMouseUp = (e) => {
    if (timer) {
      clearTimeout(timer); // Cancel if released early
      setTimer(null);
    }
  };

  // Return true if the task is older than 7 days
  const canNotEdit = (date2) => {
    const timeDifference = new Date() - date2;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference > 7; // Allow editing if the task is not more than 7 days old
  };

  const handleUpdateTask = async ({ editingField, e = null }) => {
    // Check if dueDate of the task is not more than 7 days ago


    if (canNotEdit(new Date(task.dueDate))) {
      return;
    }

    setIsProcessing(true);
    try {
      var updatedTask = {};

      if (editingField === "startTime") {
        updatedTask = {
          ...task,
          startTime: newStartTime,
          duration: newDuration,
        };
        setEditingField(null); // Close the editing field after saving
      } else if (editingField === "status") {
        updatedTask = {
          ...task,
          status: "Cancelled",
        };
      } else {
        if (isLongPress) {
          e.preventDefault();
          return;
        }
        updatedTask = {
          ...task,
          status:
            task.status === "Pending"
              ? "In Progress"
              : task.status === "In Progress"
              ? "Completed"
              : "Pending",
        };
      }

      const updatedTaskWithExtra = {
        ...updatedTask,
        oldStatus: task.status,
        userId: task.owner,
      };

      const response = await api.patch("updateTask", updatedTaskWithExtra, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // const result = await response.json();
      // onUpdate(response.data.data[0]); // Update the task in the parent component
    } catch (error) {
      console.error(error);
      alert("Error: " + error);
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
      }
        ${task.status === "Cancelled" && "opacity-25"}`}
    >
      <div>
        {/* Start Time (Top Left) */}
        <span
          className="absolute top-0 left-0 text-sm p-1 bg-yellow-600 text-white rounded-br-xl cursor-pointer flex items-center"
          onDoubleClick={() => setEditingField("startTime")}
        >
          {editingField === "startTime" ? (
            <div className="flex items-center gap-2 bg-yellow-700 p-1 rounded-lg shadow-md">
              {/* Time Input */}
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="bg-yellow-600 text-white outline-none px-2 py-1 rounded-md "
                autoFocus
              />

              {/* Duration Select */}
              <select
                name="duration"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="bg-yellow-600 text-white px-2 py-1 rounded-md outline-none shadow-md"
              >
                {[5, 15, 30, 45, 60, 75, 90, 105, 120].map((minutes) => {
                  const hours = minutes / 60;
                  const label =
                    minutes > 59
                      ? `${parseInt(hours)} hr ${
                          minutes % 60 ? ` ${minutes % 60} min` : ""
                        }`
                      : `${minutes} min`;
                  return (
                    <option key={minutes} value={minutes}>
                      {label}
                    </option>
                  );
                })}
              </select>

              {/* Tick Button (Save) */}
              <button
                onClick={() => {
                  handleUpdateTask({ editingField: "startTime" });
                }}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
              >
                ✔
              </button>

              {/* Close Button (Cancel) */}
              <button
                onClick={() => {
                  setEditingField(null);
                  setNewStartTime(task.startTime);
                  setNewDuration(task.duration);
                }} // Cancels editing
                className="bg-red-400 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
              >
                ❌
              </button>
            </div>
          ) : (
            <span className="cursor-pointer bg-yellow-600 text-white rounded-md">
              {formatTime(task.startTime)} ({task.duration} min)
            </span>
          )}
        </span>

        {/* End Time (Bottom Left) */}
        <span className="absolute bottom-0 left-0 flex gap-2 items-center text-sm  p-1 bg-yellow-600 text-white rounded-tr-xl ">
          <div>{formatTime(task.startTime, task.duration)}</div>
          {task.recurringTaskId && (
            <RefreshCw className="w-3 h-3 text-white" title="Recurring Task" />
          )}
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
          className={`px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 flex items-center gap-1 ${
            getTextColor(statusColors[task.status]) ||
            "text-green-100 dark:text-gray-700"
          } ${
            !canNotEdit(new Date(task.dueDate))
              ? " "
              : "opacity-70 cursor-default"
          } `}
          onClick={(e) => handleUpdateTask({ e })}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown} // Mobile support
          onTouchEnd={handleMouseUp} // Mobile support
        >
          <div className={``}>
            {task.status === "In Progress" ? (
              <FaSpinner title="In Progress" />
            ) : task.status === "Completed" ? (
              <FaCheckCircle title="Completed" />
            ) : task.status === "Pending" ? (
              <FaHourglassStart title="Pending" />
            ) : (
              <FaTimesCircle title="Cancelled" />
            )}
          </div>

          <div className={` `}>{task.status}</div>
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
