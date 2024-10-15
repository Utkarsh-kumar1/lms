"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
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
    }, 1500);

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
        isCompleted ? "bg-green-100" : "bg-white hover:shadow-lg"
      }`}
    >
      {/* Task Name and Streak */}
      <div className="flex flex-col">
        <span className="text-gray-800  text-sm font-bold sm:font-semibold sm:text-lg">
          {activity.task}
        </span>
        <div className="flex items-center mt-1 text-sm text-gray-500">
          <span className="mr-2 text-sm sm:text-lg">
            Streak: {activity.streak} {activity.isBestStreak && "🔥"}
          </span>
          {activity.isBestStreak && (
            <span className="bg-yellow-300 text-yellow-900 px-2 py-1 rounded-full font-medium text-xs flex items-center">
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
            isCompleted ? "text-green-600" : "text-red-500"
          }`}
        >
          {isCompleted ? "Completed" : "Pending"}
        </span>
        <Switch
          disabled={
            isProcessing ||
            new Date().toDateString() !==
              new Date(activity.startDate).toDateString()
          }
          checked={isCompleted}
          onCheckedChange={(status) => {
            setIsCompleted(status);
          }} // Toggle completion status
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
            activity.isCompleted ? "bg-green-500" : "bg-gray-300"
          }`}
        />
        {/* Delete Button */}
        {new Date().toDateString() ===
          new Date(activity.startDate).toDateString() && (
          <button
            onClick={() => setIsModalOpen(true)}
            className=" text-white rounded"
          >
            <Trash2 className="w-5 h-5 " color="red" />
          </button>
        )}
      </div>

      {/* Modal for Confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            <p>Are you sure you want to delete this activity?</p>
            {errors.deleteError && (
              <p className="text-red-400 w-full text-center">
                {errors.deleteError}
              </p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
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
