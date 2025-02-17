"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Trash2, Star } from "lucide-react";
import axios from "axios";
import { DeleteActivity } from "@/actions/DeleteActivity";

export const ActivityItem = ({ activity }) => {
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

  const handleStatusChange = () => {
    setStatus((prev) =>
      prev === "Pending" ? "In Progress" : prev === "In Progress" ? "Completed" : "Pending"
    );
  };

  const handleDelete = async () => {
    const { success, error } = await DeleteActivity(activity.title, activity.id);
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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const formatTime = (time) => {
    let [hours, minutes, seconds] = time.split(":").map(Number);
    let date = new Date();
    date.setHours(hours, minutes, seconds);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const wasUpdatedRecently = lastUpdated && (new Date() - lastUpdated) / 1000 < 30;

  return (
    <div
      className={`relative flex justify-between items-center p-4 mb-3 rounded-lg shadow-sm transition-all duration-300 ${
        status === "Completed" ? "bg-green-100 dark:bg-green-900" : "bg-white dark:bg-gray-700 hover:shadow-lg"
      }`}
    >
      <div className="flex flex-col">
        <span className="text-gray-800 dark:text-gray-200 text-sm font-bold sm:font-semibold sm:text-lg">
          {activity.title}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</span>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(activity.dueDate)}, {formatTime(activity.startTime)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Duration: {activity.duration} minutes</div>
        <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="mr-2 text-sm sm:text-lg">
            Streak: {activity.streak} {activity.streak !== 0 ? "🔥" : ""}
          </span>
          {activity.isBestStreak && (
            <span className="bg-yellow-300 dark:bg-yellow-500 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded-full font-medium text-xs flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Best Streak
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="px-3 py-1 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
          onClick={handleStatusChange}
        >
          {status}
        </button>
        <span className="px-3 py-1 text-sm font-semibold text-white bg-gray-500 rounded-lg cursor-default">
          Priority: {activity.priority}
        </span>
        <button onClick={() => setIsModalOpen(true)} className="text-white rounded">
          <Trash2 className="w-5 h-5" color="red" />
        </button>
      </div>

      {wasUpdatedRecently && (
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
          Last updated just now
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Confirm Deletion</h2>
            <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete this activity?</p>
            {errors.deleteError && (
              <p className="text-red-400 dark:text-red-300 w-full text-center">{errors.deleteError}</p>
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