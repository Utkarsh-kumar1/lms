"use client";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { AddMicroPlanner } from "@/actions/AddMicroPlanner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { DeleteMicroPlanner } from "@/actions/DeleteMicroPlanner";
import { time } from "drizzle-orm/mysql-core";

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
    }),
    totalTime: "15", // Default value in minutes
  });
  const router = useRouter();

  useEffect(() => {
    console.log("isModalOpen", isModalOpen);
  }, [isModalOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
    const month = today.toLocaleString("en-GB", { ...options, month: "2-digit" });
    const day = today.toLocaleString("en-GB", { ...options, day: "2-digit" });
    const hour = today.toLocaleString("en-GB", { ...options, hour: "2-digit" });
    const minute = today.toLocaleString("en-GB", { ...options, minute: "2-digit" });
    const second = today.toLocaleString("en-GB", { ...options, second: "2-digit" });

    // Format as MySQL compatible string
    const mysqlFormat = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    console.log("MySQL Format:", mysqlFormat);
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
      const year = today.toLocaleString("en-GB", { ...options, year: "numeric" });
      const month = today.toLocaleString("en-GB", { ...options, month: "2-digit" });
      const day = today.toLocaleString("en-GB", { ...options, day: "2-digit" });
      const hour = today.toLocaleString("en-GB", { ...options, hour: "2-digit" });
      const minute = today.toLocaleString("en-GB", { ...options, minute: "2-digit" });
      const second = today.toLocaleString("en-GB", { ...options, second: "2-digit" });

      // Format as MySQL compatible string
      const mysqlFormat = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

      console.log("MySQL Format:", mysqlFormat);
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
    return new Date(time).toLocaleString("en-US", options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const calculatedStartTime = calculateStartTime();
    const calculatedEndTime = calculateEndTime();
    console.log(calculatedStartTime, calculatedEndTime);

    AddMicroPlanner(formData.name, calculatedStartTime, calculatedEndTime);
  };

  const handleDelete = async () => {
    // console.log("Delete button clicked", isModalOpen);
    // Call the server action to delete the MicroPlanner
    const { success, error } = await DeleteMicroPlanner(isModalOpen);
    if (success) {
      setIsModalOpen("0");
      router.refresh();
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
        console.log(result);
      })
      .catch((err) => {
        console.error("Error toggling completion status", err);
      });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
        Micro Planner
      </h1>

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

      <h2 className="text-lg sm:text-2xl font-semibold mb-4 text-gray-700">
        Tasks for Today
      </h2>
      <div className="overflow-auto max-h-[400px] border rounded">
        <table className="table-auto w-full border-collapse text-sm sm:text-base">
          <thead>
            <tr>
              <th className="px-2 sm:px-4 py-2 text-left border-b">Name</th>
              <th className="px-2 sm:px-4 py-2 text-left border-b">Start</th>
              <th className="px-2 sm:px-4 py-2 text-left border-b">End</th>
              <th className="px-2 sm:px-4 py-2 text-left border-b">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="px-2 sm:px-4 py-2 border-b">{item.name}</td>
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
