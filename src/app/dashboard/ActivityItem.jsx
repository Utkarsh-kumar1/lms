"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Crown, Music, RefreshCcw, RefreshCw, Trash2, User, Zap } from "lucide-react";
import axios from "axios";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { DeleteActivity } from "@/actions/DeleteActivity";

export const ActivityItem = ({ activity }) => {
  const [isCompleted, setIsCompleted] = useState(activity.isCompleted);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [errors, setErrors] = useState({ deleteError: "" });
  const router = useRouter();

  useEffect(() => {
    console.log("Activity", activity);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isCompleted !== activity.isCompleted) {
        setIsProcessing(false);

        axios
          .patch(`/api/dailyActivities`, {
            status: isCompleted,
            id: activity.id,
          })
          .then((result) => {
            setIsProcessing(false);
            router.refresh();
          })
          .catch((err) => {
            setIsCompleted(activity.isCompleted);
          });
      }
    }, 1);

    return () => {
      clearTimeout(handler);
    };
  }, [isCompleted, activity.id, activity.isCompleted, router]);

  const handleDelete = async () => {
    // Call the server action to delete the activity
    const { success, error } = await DeleteActivity(activity.task, activity.id);
    if (success) {
      setIsModalOpen(false);
      router.refresh();
    } else if (error) {
      setErrors((prev) => ({
        ...prev,
        deleteError: error || "Something Went Wrong",
      }));
    }
  };

  return (
    <div
      className={`flex justify-between items-center p-4 mb-3 rounded-lg shadow-sm transition-all duration-300 ${
        isCompleted
          ? "bg-green-100 dark:bg-green-900"
          : "bg-white dark:bg-gray-700 hover:shadow-lg"
      }`}
    >
      {/* Task Name and Streak */}
      <div className="flex flex-col">
        <span className="text-gray-800 dark:text-gray-200 text-sm font-bold sm:font-semibold sm:text-lg">
          {activity.title}
        </span>
        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-2 text-sm sm:text-lg">
            Streak: {activity.streak} {activity.streak != 0 ? "🔥" : ""}
           
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



          {activity.isBestStreak && (
            <span className="bg-yellow-300 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-full font-medium text-xs flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Best Streak
            </span>
          )}
        </div>
      </div>

      {/* Completion Status and Switch */}
      <div className="flex items-center gap-4">
        <span
          className={`text-sm font-semibold hidden sm:flex ${
            isCompleted
              ? "text-green-600 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          }`}
        >
          {isCompleted ? "Completed" : "Pending"}
        </span>
        <Switch
          disabled={
            isProcessing ||
            (new Date() - new Date(activity.startDate)) /
              (1000 * 60 * 60 * 24) >
              7
          }
          checked={isCompleted}
          onCheckedChange={(status) => {
            setIsCompleted(status);
          }} // Toggle completion status
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
            isCompleted
              ? "bg-green-500 dark:bg-green-600"
              : "bg-gray-300 dark:bg-gray-600"
          }`}
        />
        {/* Delete Button */}
        {new Date().toDateString() ===
          new Date(activity.startDate).toDateString() && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white rounded"
          >
            <Trash2 className="w-5 h-5" color="red" />
          </button>
        )}
      </div>

      {/* Modal for Confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this activity?
            </p>
            {errors.deleteError && (
              <p className="text-red-400 dark:text-red-300 w-full text-center">
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
