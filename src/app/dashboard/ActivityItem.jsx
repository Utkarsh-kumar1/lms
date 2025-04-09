"use client";
import React, { useEffect, useState } from "react";
import {
  Crown,
  Music,
  Star,
  Ellipsis,
  RefreshCw,
  Trash2,
  User,
  Zap,
  Trash,
  Pencil,
} from "lucide-react";
import axios from "axios";
import { DeleteActivity } from "@/actions/DeleteActivity";
import { set } from "zod";
import { is } from "drizzle-orm";

export const ActivityItem = ({ activity, reload }) => {
  const [updatedActivity, setUpdatedActivity] = useState(activity);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({ deleteError: "" });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [timer, setTimer] = useState(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const handleMouseDown = () => {
    setIsLongPress(false);
    const newTimer = setTimeout(() => {
      setUpdatedActivity((prev) => ({
        ...prev,
        status: "Cancelled",
      }));
      setIsLongPress(true);
    }, 2000); // 2 second hold
    setTimer(newTimer);
  };

  const handleMouseUp = (e) => {
    if (timer) {
      clearTimeout(timer); // Cancel if released early
      setTimer(null);
    }
  };

  const handleStatusChange = (e) => {
    if (isLongPress) {
      e.preventDefault();
      return;
    }
    setUpdatedActivity((prev) => ({
      ...prev,
      status:
        prev.status === "Pending"
          ? "In Progress"
          : prev.status === "In Progress"
          ? "Completed"
          : "Pending",
    }));
  };

  const handleChange = (field, value) => {
    if (field === "startTime") {
      setUpdatedActivity((prev) => ({
        ...prev,
        [field]: value + ":00",
      }));
    } else if (field === "duration") {
      setUpdatedActivity((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = () => {
    setEditingField(null);
    // Check if activity and updatedActivity are different before sending a request

    if (
      activity.startTime !== updatedActivity.startTime ||
      activity.duration !== updatedActivity.duration
    ) {
      setIsProcessing(true);
      axios
        .patch(`/api/buildingBlocks`, {
          startTime: updatedActivity.startTime,
          duration: updatedActivity.duration,
          id: updatedActivity.id,
        })
        .then(() => {
          setLastUpdated(new Date());
          reload();
        })
        .catch(() => {
          setUpdatedActivity(activity);
        })
        .finally(() => setIsProcessing(false));
    }
  };

  useEffect(() => {
    if (activity.status !== updatedActivity.status) {
      axios
        .patch(`/api/buildingBlocks`, {
          status: updatedActivity.status,
          id: updatedActivity.id,
        })
        .then(() => {
          setLastUpdated(new Date());
          // router.refresh();
        })
        .catch(() => {
          setUpdatedActivity((prev) => ({
            ...prev,
            status: prev.status,
          }));
        });
    }
  }, [updatedActivity.status]);

  useEffect(() => {
    if (lastUpdated) {
      const timer = setTimeout(() => setLastUpdated(null), 60000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdated]);

  const handleDelete = async () => {
    const id = updatedActivity.id;
    try {
      const response = await axios.delete(`/api/buildingBlocks`, {
        data: { id },
      });
      setIsModalOpen(false);
      // router.refresh();
      reload();
    } catch (error) {
      // setErrors((prev) => ({
      //   ...prev,
      //   deleteError: error || "Something Went Wrong",
      // }));
      console.error("Error deleting:", error);
    }
  };

  function addMinutes(time, minutesToAdd) {
    let [hours, minutes, seconds] = time.split(":").map(Number);

    let date = new Date();
    date.setHours(hours, minutes + minutesToAdd, seconds);

    return date.toTimeString().slice(0, 8);
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (time) => {
    let [hours, minutes, seconds] = time.split(":").map(Number);
    let date = new Date();
    date.setHours(hours, minutes, seconds);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const wasUpdatedRecently =
    lastUpdated && (new Date() - lastUpdated) / 1000 < 30;

  // Function to determine the background color for status (applied to the entire card)
  const getStatusBgColor = () => {
    switch (updatedActivity.status) {
      case "Completed":
        return "bg-green-100 dark:bg-green-500";
      case "In Progress":
        return "bg-yellow-100 dark:bg-yellow-500";
      case "Pending":
        return "bg-gray-100 dark:bg-gray-500";
      default:
        return "bg-white dark:bg-gray-700";
    }
  };

  // Function to determine the color for priority (applied to the priority label)
  const getPriorityBgColor = () => {
    switch (updatedActivity.priority) {
      case "High":
        return "bg-red-500 text-white";
      case "Medium":
        return "bg-orange-500 text-white";
      case "Low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-800 text-white";
    }
  };

  return (
    <div
      className={`relative  py-4 pr-4 mb-3 rounded-lg shadow-sm transition-all duration-300  
    ${getStatusBgColor()}  ${
        updatedActivity.status === "Cancelled" && "opacity-25"
      }
`}
    >
      {/* Start Time (Top Left) */}
      <span
        className="absolute top-0 left-0 text-sm p-1 bg-yellow-600 text-white rounded-tl-xl rounded-br-xl cursor-pointer flex items-center"
        onDoubleClick={() => setEditingField("startTime")}
      >
        {editingField === "startTime" ? (
          <div className="flex items-center gap-2 bg-yellow-700 p-1 rounded-lg shadow-md">
            {/* Time Input */}
            <input
              type="time"
              value={updatedActivity.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="bg-yellow-600 text-white outline-none px-2 py-1 rounded-md "
              autoFocus
            />

            {/* Duration Select */}
            <select
              name="duration"
              value={updatedActivity.duration}
              onChange={(e) =>
                handleChange("duration", parseInt(e.target.value, 10))
              }
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
              onClick={handleSave}
              className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
            >
              ✔
            </button>

            {/* Close Button (Cancel) */}
            <button
              onClick={() => {
                setEditingField(null);
                setUpdatedActivity(activity);
              }} // Cancels editing
              className="bg-red-400 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
            >
              ❌
            </button>
          </div>
        ) : (
          <span className="cursor-pointer bg-yellow-600 text-white rounded-md">
            {formatTime(updatedActivity.startTime)} ({updatedActivity.duration}{" "}
            min)
          </span>
        )}
      </span>

      {/* End Time (Bottom Left) */}
      <span className="absolute bottom-0 left-0 flex gap-2 items-center text-sm  p-1 bg-yellow-600 text-white rounded-tr-xl rounded-bl-xl">
        <div>
          {formatTime(
            addMinutes(updatedActivity.startTime, updatedActivity.duration)
          )}
        </div>
        {updatedActivity.recurringTaskId && (
          <RefreshCw className="w-3 h-3 text-white" title="Recurring Task" />
        )}
      </span>

      {/* Edit Button (Top Right) */}
      <button className="absolute top-0 right-0 bg-blue-300 text-white p-1 rounded-full shadow-md">
        <Pencil size={16} />
      </button>

      {/* Delete Button (Bottom Right) */}
      <button
        className="absolute bottom-0 right-0 bg-red-300 text-white p-1 rounded-full shadow-md"
        onClick={() => setIsModalOpen(true)}
      >
        <Trash size={16} />
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pl-4 border-l-4 border-l-yellow-600 ">
        {/* updatedActivity Details */}
        <div
          className={`flex flex-col flex-1 my-4  ${
            editingField === "startTime" && "mt-8"
          } `}
        >
          <span className="text-gray-800 dark:text-gray-200 text-base sm:text-lg font-semibold">
            {updatedActivity.title}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {updatedActivity.description}
          </span>
          
          {updatedActivity.recurringTaskId && (
            <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
              <span className="mr-2">
                Streak: {updatedActivity.streak}{" "}
                {updatedActivity.streak !== 0 ? "🔥" : ""}
              </span>

              {updatedActivity.isBestStreak > 1 && (
                <span className="bg-yellow-300 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-full font-medium text-xs flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Best Streak
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-6 sm:mb-0 mr-6">
          {updatedActivity.streak > 0 &&
            (updatedActivity.streak <= 7 ? (
              <span className="bg-green-200 dark:bg-green-400 text-green-800 dark:text-green-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                <Zap className="w-5 h-5 mr-2 text-green-600 dark:text-green-200" />
                Spark Phase
                <span className="ml-1 font-normal text-xs bg-green-300 text-green-900 dark:bg-green-500 dark:text-green-100 px-2 py-0.5 rounded-full">
                  Days 1–7
                </span>
              </span>
            ) : updatedActivity.streak <= 28 ? (
              <span className="bg-blue-200 dark:bg-blue-400 text-blue-800 dark:text-blue-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                <RefreshCw className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-200" />
                Momentum Phase
                <span className="ml-1 font-normal text-xs bg-blue-300 text-blue-900 dark:bg-blue-500 dark:text-blue-100 px-2 py-0.5 rounded-full">
                  Week 2–4
                </span>
              </span>
            ) : updatedActivity.streak <= 90 ? (
              <span className="bg-purple-200 dark:bg-purple-400 text-purple-800 dark:text-purple-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                <Music className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-200" />
                Rhythm Phase
                <span className="ml-1 font-normal text-xs bg-purple-300 text-purple-900 dark:bg-purple-500 dark:text-purple-100 px-2 py-0.5 rounded-full">
                  Month 2–3
                </span>
              </span>
            ) : updatedActivity.streak <= 180 ? (
              <span className="bg-yellow-200 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
                <User className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-200" />
                Identity Phase
                <span className="ml-1 font-normal text-xs bg-yellow-300 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-100 px-2 py-0.5 rounded-full">
                  Month 4–6
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
          <button
            className="w-full sm:w-auto px-3 py-1 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
            onClick={handleStatusChange}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown} // Mobile support
            onTouchEnd={handleMouseUp} // Mobile support
          >
            {updatedActivity.status}
          </button>
          <span
            className={`w-full sm:w-auto px-3 py-1 text-sm font-semibold text-white ${getPriorityBgColor()} rounded-lg text-center`}
          >
            Priority: {updatedActivity.priority}
          </span>
          {/* <button onClick={() => setIsModalOpen(true)} className="text-white">
          <Trash2 className="w-5 h-5 text-red-500" />
        </button> */}
        </div>

        {wasUpdatedRecently && (
          <div className="flex items-center justify-center gap-1 absolute bottom-0 right-8 text-xs text-gray-500 dark:text-gray-400">
            <Ellipsis /> <div>Updated just now</div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this activity?
            </p>
            {errors.deleteError && (
              <p className="text-red-400 dark:text-red-300 text-center mt-2">
                {errors.deleteError}
              </p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
