"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Crown, Music, Star, Ellipsis, RefreshCw, Trash2, User, Zap } from "lucide-react";
import axios from "axios";
import { DeleteActivity } from "@/actions/DeleteActivity";

export const ActivityItem = ({ activity, reload }) => {
  const [status, setStatus] = useState(activity.status);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState({ deleteError: "" });
  const [lastUpdated, setLastUpdated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (status !== activity.status) {
      axios
        .patch(`/api/buildingBlocks`, { status, id: activity.id })
        .then(() => {
          setLastUpdated(new Date());
          router.refresh();
        })
        .catch(() => {
          setStatus(activity.status);
        });
    }
  }, [status, activity.id, activity.status, router]);

  useEffect(() => {
    if (lastUpdated) {
      const timer = setTimeout(() => setLastUpdated(null), 60000);
      return () => clearTimeout(timer);
    }
  }, [lastUpdated]);

  const handleStatusChange = () => {
    setStatus((prev) =>
      prev === "Pending"
        ? "In Progress"
        : prev === "In Progress"
        ? "Completed"
        : "Pending"
    );
  };

  const handleDelete = async () => {
    const id = activity.id;
    try {
      const response = await axios.delete(`/api/buildingBlocks`, {
        data: { id },
      });
      setIsModalOpen(false);
      // router.refresh();
      reload();
      // console.log("Deleted successfully:", response.data);

    } catch (error) {
      // setErrors((prev) => ({
      //   ...prev,
      //   deleteError: error || "Something Went Wrong",
      // }));
      console.error("Error deleting:", error);
    }
  };

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
    switch (status) {
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
    switch (activity.priority) {
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
  className={`relative flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 mb-3 rounded-lg shadow-sm transition-all duration-300 
    ${getStatusBgColor()}
`}
>
    
      {/* Activity Details */}
      <div className="flex flex-col flex-1">
        <span className="text-gray-800 dark:text-gray-200 text-base sm:text-lg font-semibold">
          {activity.title}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {activity.description}
        </span>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatTime(activity.startTime)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Duration: {activity.duration} minutes
        </div>
        {activity.recurringTaskId && (

        <div className="flex flex-wrap items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-2">
            Streak: {activity.streak} {activity.streak !== 0 ? "🔥" : ""}
            </span>
            
            {activity.streak > 0 && (activity.streak <= 7 ?
            
            (<span className="bg-green-200 dark:bg-green-400 text-green-800 dark:text-green-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
          <Zap className="w-5 h-5 mr-2 text-green-600 dark:text-green-200" />
          Spark Phase
          <span className="ml-1 font-normal text-xs bg-green-300 text-green-900 dark:bg-green-500 dark:text-green-100 px-2 py-0.5 rounded-full">
            Days 1–7</span>
          </span>)
            
            : activity.streak <= 28 ?

           (<span className="bg-blue-200 dark:bg-blue-400 text-blue-800 dark:text-blue-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
          <RefreshCw className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-200" />
          Momentum Phase
          <span className="ml-1 font-normal text-xs bg-blue-300 text-blue-900 dark:bg-blue-500 dark:text-blue-100 px-2 py-0.5 rounded-full">Week 2–4</span>
          </span>) :

              activity.streak <= 90 ?
          
                (<span className="bg-purple-200 dark:bg-purple-400 text-purple-800 dark:text-purple-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
          <Music className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-200" />
          Rhythm Phase
          <span className="ml-1 font-normal text-xs bg-purple-300 text-purple-900 dark:bg-purple-500 dark:text-purple-100 px-2 py-0.5 rounded-full">Month 2–3</span>
                </span>)
                :
                activity.streak <= 180 ?
          
          (<span className="bg-yellow-200 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
          <User className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-200" />
          Identity Phase
          <span className="ml-1 font-normal text-xs bg-yellow-300 text-yellow-900 dark:bg-yellow-500 dark:text-yellow-100 px-2 py-0.5 rounded-full">Month 4–6</span>
                  </span>)
                  :
                  
          
          (<span className="bg-red-200 dark:bg-red-400 text-red-800 dark:text-red-100 px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm flex items-center mr-1">
          <Crown className="w-5 h-5 mr-2 text-red-600 dark:text-red-200" />
          Mastery Phase
          <span className="ml-1 font-normal text-xs bg-red-300 text-red-900 dark:bg-red-500 dark:text-red-100 px-2 py-0.5 rounded-full">6+ Months</span>
          </span>))}



          {activity.isBestStreak > 1 && (
            <span className="bg-yellow-300 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-full font-medium text-xs flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Best Streak
            </span>
          )}
          </div>
        )}
          
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-0">
        <button
          className="w-full sm:w-auto px-3 py-1 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          onClick={handleStatusChange}
        >
          {status}
        </button>
        <span className={`w-full sm:w-auto px-3 py-1 text-sm font-semibold text-white ${getPriorityBgColor()} rounded-lg text-center`}>
          Priority: {activity.priority}
        </span>
        <button onClick={() => setIsModalOpen(true)} className="text-white">
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {wasUpdatedRecently && (
        <div className="flex items-center justify-center gap-1 absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
          <Ellipsis /> <div>Updated just now</div>
        </div>
      )}

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
