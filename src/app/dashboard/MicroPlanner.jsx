"use client";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { AddMicroPlanner } from "@/actions/AddMicroPlanner";
import { useRouter } from "next/navigation";

const MicroPlanner = ({ userData }) => {
    const [data, setData] = useState(userData);
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
        const totalMinutes = parseInt(formData.totalTime, 10);
        return today.toISOString().slice(0, 16); // Return in 'YYYY-MM-DDTHH:MM' format
        
        // return "";
      };

  const calculateEndTime = () => {
    const [hours, minutes] = formData.start.split(":").map(Number);
    const today = new Date();
    today.setHours(hours, minutes, 0, 0); // Set the time based on user input
    const totalMinutes = parseInt(formData.totalTime, 10);

    if (totalMinutes) {
      today.setMinutes(today.getMinutes() + totalMinutes); // Add total time in minutes
      return today.toISOString().slice(0, 16); // Return in 'YYYY-MM-DDTHH:MM' format
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

    // const response = await fetch("/api/microPlanner", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ ...formData, end: calculatedEndTime }),
      // });
      
      AddMicroPlanner(formData.name, calculatedStartTime, calculatedEndTime);


    // if (response.ok) {
    //   setFormData({
    //     name: "",
    //     start: "",
    //     totalTime: "15",
    //   });
    //   const result = await response.json();
    // //   setData(result);
    // } else {
    //   console.error("Error submitting form");
    // }
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
        Micro Planner
      </h1>

      <div className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-lg font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-lg font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                name="start"
                value={formData.start}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-lg font-medium text-gray-700">
                Total Time
              </label>
              <select
                name="totalTime"
                value={formData.totalTime}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit Task
          </button>
        </form>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Tasks for Today
      </h2>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left border-b">Name</th>
            <th className="px-4 py-2 text-left border-b">Start</th>
            <th className="px-4 py-2 text-left border-b">End</th>
            <th className="px-4 py-2 text-left border-b">Completed</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100">
              <td className="px-4 py-2 border-b">{item.name}</td>
              <td className="px-4 py-2 border-b">{formatTime(item.start)}</td>
              <td className="px-4 py-2 border-b">{formatTime(item.end)}</td>
              <td className="px-4 py-2 border-b">
                <Switch
                  checked={item.completed? true : false}
                  onCheckedChange={(status) => toggleCompleted(item.id, status)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ${
                    item.completed ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MicroPlanner;
