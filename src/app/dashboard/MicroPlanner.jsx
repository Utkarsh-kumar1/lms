"use client";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { AddMicroPlanner } from "@/actions/AddMicroPlanner";
import { useRouter } from "next/navigation";
import { Edit, Edit2, Edit2Icon, Trash2 } from "lucide-react";
import { DeleteMicroPlanner } from "@/actions/DeleteMicroPlanner";
import { time } from "drizzle-orm/mysql-core";
import { FiEdit, FiEdit2, FiEdit3 } from "react-icons/fi";

const MicroPlanner = ({ userData }) => {
  const [data, setData] = useState(userData);
  const [isModalOpen, setIsModalOpen] = useState("0"); // State for modal visibility
  const [errors, setErrors] = useState({ deleteError: "" });
  const [formData, setFormData] = useState({
    name: "",
    start: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }),
    totalTime: "15", // Default value in minutes
  });

  const editingTask = (item) => {
    
    setFormData({
      name: item.name,
      start: item.start,
      totalTime: item.totalTime,
    })
  };

  useEffect(() => {
    setData(userData);
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "start") {
      formatTime(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // console.log(e.target.value);
  };

  const calculateStartTime = () => {
    const [hours, minutes] = formData.start.split(":").map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0); // Set the time based on user input

    // Convert to IST and format for MySQL
    const options = { timeZone: "Asia/Kolkata", hour12: false };
    const year = today.toLocaleString("en-GB", { ...options, year: "numeric" });
    const month = today.toLocaleString("en-GB", {
      ...options,
      month: "2-digit",
    });
    const day = today.toLocaleString("en-GB", { ...options, day: "2-digit" });
    const hour = today.toLocaleString("en-GB", { ...options, hour: "2-digit" });
    const minute = today.toLocaleString("en-GB", {
      ...options,
      minute: "2-digit",
    });
    const second = today.toLocaleString("en-GB", {
      ...options,
      second: "2-digit",
    });

    // Format as MySQL compatible string
    const mysqlFormat = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    return mysqlFormat;
  };

  const calculateEndTime = () => {
    const [hours, minutes] = formData.start.split(":").map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0); // Set the time based on user input
    const totalMinutes = parseInt(formData.totalTime, 10);

    if (totalMinutes) {
      today.setMinutes(today.getMinutes() + totalMinutes); // Add total time in minutes

      // Convert to IST and format for MySQL
      const options = { timeZone: "Asia/Kolkata", hour12: false };
      const year = today.toLocaleString("en-GB", {
        ...options,
        year: "numeric",
      });
      const month = today.toLocaleString("en-GB", {
        ...options,
        month: "2-digit",
      });
      const day = today.toLocaleString("en-GB", { ...options, day: "2-digit" });
      const hour = today.toLocaleString("en-GB", {
        ...options,
        hour: "2-digit",
      });
      const minute = today.toLocaleString("en-GB", {
        ...options,
        minute: "2-digit",
      });
      const second = today.toLocaleString("en-GB", {
        ...options,
        second: "2-digit",
      });

      // Format as MySQL compatible string
      const mysqlFormat = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

      return mysqlFormat;
      // return today.toISOString().slice(0, 16); // Return in 'YYYY-MM-DDTHH:MM' format
    }
    return "";
  };

  const formatTime = (time) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };

    const inputDate = new Date(time);
    const currentDate = new Date();

    // Helper to check if a date is in the current week
    const isCurrentWeek = (date) => {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);

      return date >= startOfWeek && date <= endOfWeek;
    };

    // Check if the date is today
    if (inputDate.toDateString() === currentDate.toDateString()) {
      return `${inputDate.toLocaleString("en-US", options)}`;
    }

    // Check if the date is yesterday
    const yesterday = new Date();
    yesterday.setDate(currentDate.getDate() - 1);
    if (inputDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${inputDate.toLocaleString("en-US", options)}`;
    }

    // Check if the date is in the current week
    if (isCurrentWeek(inputDate)) {
      return `${inputDate.toLocaleString("en-US", {
        weekday: "short",
      })}, ${inputDate.toLocaleString("en-US", options)}`;
    }

    // Return full date in format (e.g., 12, Jan and time)
    return `${inputDate.getDate()}, ${inputDate.toLocaleString("en-US", {
      month: "short",
    })}, ${inputDate.toLocaleString("en-US", options)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const calculatedStartTime = calculateStartTime();
    const calculatedEndTime = calculateEndTime();

    AddMicroPlanner(formData.name, calculatedStartTime, calculatedEndTime);

    setFormData({
      name: "",
      start: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }),
      totalTime: "15", // Default value in minutes
    });
  };

  const handleDelete = async () => {
    // console.log("Delete button clicked", isModalOpen);
    // Call the server action to delete the MicroPlanner
    const { success, error } = await DeleteMicroPlanner(isModalOpen);
    if (success) {
      setIsModalOpen("0");
      // router.refresh();
    } else if (error) {
      setErrors((prev) => ({
        ...prev,
        deleteError: error || "Something Went Wrong",
      }));
    }
  };

  // This function updates database when a task is toggled as completed
  const toggleCompleted = async (id) => {
    const task = data.find((task) => task.id === id);
    const updatedTask = {
      ...task,
      completed: task.completed ? null : new Date().toISOString(),
    };

    axios
      .patch(`/api/microPlanner`, {
        status: updatedTask.completed ? 0 : 1,
        id: id,
      })
      .then((result) => {
        const updatedData = data.map((item) =>
          item.id === id ? { ...item, completed: updatedTask.completed } : item
        );
        setData(updatedData);
      })
      .catch((err) => {
        console.error("Error toggling completion status", err);
      });
  };

  return (
    <div className="container mx-auto p-2 sm:p-1">
      {/* Heading */}
      <h1 className="text-1xl sm:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
        Planner
      </h1>

      {/* Form for Planner task */}
      <div className="mb-6 sm:mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base sm:text-lg font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              autoComplete="off"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <label className="block text-base sm:text-lg font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                name="start"
                value={formData.start}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-base sm:text-lg font-medium text-gray-700">
                Total Time
              </label>
              <select
                name="totalTime"
                value={formData.totalTime}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[15, 30, 45, 60, 75, 90, 105, 120].map((minutes) => {
                  const hours = minutes / 60;
                  const label =
                    minutes > 59
                      ? `${hours.toFixed(2)} hours`
                      : `${minutes} minutes`;
                  return (
                    <option key={minutes} value={minutes}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md text-sm sm:text-base hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Task
          </button>
        </form>
      </div>

      {/* All tasks data which was either created or ended or updated today or not completed */}
      <div className="overflow-auto max-h-[400px] border rounded">
        <table className="table-auto w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left border-b">Name</th>
              <th className="px-2 sm:px-4 py-2 text-left border-b">Start</th>
              <th className="px-2 sm:px-4 py-2 text-left border-b">End</th>
              <th className="px-2 sm:px-4 py-2 text-left border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className=" flex items-center px-2 sm:px-4 py-2 border-b">
                  {item.name}
                  <FiEdit3 className="ml-1 cursor-pointer " onClick={() => editingTask(item)} />
                </td>
                <td className="px-2 sm:px-4 py-2 border-b">
                  {formatTime(item.start)}
                </td>
                <td className="px-2 sm:px-4 py-2 border-b">
                  {formatTime(item.end)}
                </td>
                <td className="px-2 sm:px-4 py-2 border-b">
                  <Switch
                    checked={item.completed ? true : false}
                    onCheckedChange={(status) =>
                      toggleCompleted(item.id, status)
                    }
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ease-in-out ${
                      item.completed ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </td>
                <td className="px-2 sm:px-4 py-2 border-b">
                  <button
                    onClick={() => setIsModalOpen(item.id)}
                    className="text-white rounded"
                  >
                    <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" color="red" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline Component */}
      <div className="flex flex-col items-start w-full px-4 py-8 overflow-x-auto overflow-y-hidden">
        {/* Timeline Chart */}
        <div className="relative w-[200%] sm:w-[100%] h-56 min-w-full">
          {data.map((task, index) => {
            const totalDuration =
              new Date(data[data.length - 1]?.end) - new Date(data[0]?.start); // Total timeline duration
            const taskStartOffset =
              ((new Date(task.start) - new Date(data[0]?.start)) /
                totalDuration) *
              95; // Start offset percentage
            const taskDuration =
              ((new Date(task.end) - new Date(task.start)) / totalDuration) *
              95; // Task duration percentage

            const taskHeight = Math.max(Math.min(taskDuration * 4, 150), 40); // Height between 40px and 150px

            // Conditional colors based on task completion
            const taskColor = task.completed
              ? "border-green-500"
              : "border-red-500"; // Rectangle background
            const textColor = task.completed
              ? "text-green-500"
              : "text-red-500"; // Text color

            return (
              <div
                key={task.id}
                className="absolute mb-20 ml-2 sm:ml-4" // Adjusted left margin for smaller screens
                style={{
                  left: `${taskStartOffset}%`,
                  width: `${taskDuration}%`,
                  bottom: 0,
                }}
              >
                {/* Task Name Centered on the Horizontal Line of the Rectangle */}
                <div
                  className={`z-50 bg-white dark:bg-[rgb(20,24,39,1)] absolute left-1/2 transform -translate-x-1/2 -translate-y-[50%] text-xs font-medium text-center sm:text-sm ${textColor}`} // Adjusted font size for small screens
                  style={{
                    zIndex: 10,
                  }}
                >
                  {task.name}
                </div>

                {/* Task Rectangle with dynamic height */}
                <div
                  className={`relative border-2 sm:border-4 border-b-0 sm:border-b-0 rounded-t-lg ${taskColor}`}
                  style={{
                    height: `${taskHeight}px`, // Ensure height is within a visible range
                  }}
                ></div>

                {/* Times on the Timeline Line */}
                <div className="absolute flex justify-between w-full text-[9px] -bottom-6 sm:text-sm">
                  {" "}
                  {/* Smaller text size for smaller screens */}
                  {/* Start Time */}
                  <span
                    className={`absolute left-0 transform -translate-x-1/2 -rotate-45 ${textColor}`}
                  >
                    {formatTime(task.start)}
                  </span>
                  {/* End Time */}
                  <span
                    className={`absolute right-0 transform translate-x-1/2 -rotate-45 ${textColor}`}
                  >
                    {formatTime(task.end)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen != "0" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Confirm Deletion
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete this plan?
            </p>
            {errors.deleteError && (
              <p className="text-red-400 dark:text-red-300 w-full text-center">
                {errors.deleteError}
              </p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen("0")}
                className="mr-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded text-sm"
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

export default MicroPlanner;
