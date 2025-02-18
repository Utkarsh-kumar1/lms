import { AddOrUpdateTasks } from "@/actions/AddOrUpdateTasks";
import { Blocks } from "lucide-react";
import { useState, useEffect } from "react";

const initialTaskState =
{
  title: "",
  startTime: new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }),
  duration: 15,
  description: "",
  isRecurring: false,
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  recurrencePattern: "daily",
  recurrenceInterval: 1,
  recurrenceDays: ['Monday'],
  recurrenceMonthDays: [1],
  recurrenceYearDays: "",
  priority: "medium",
  customCron: "",
  customCronDescription: "",
};

export default function AddTasks({ isOpen, onClose }) {
  const [task, setTask] = useState(initialTaskState);

  const recurrenceOptions = ["Daily", "Weekly", "Monthly", "Yearly", "Custom"];
  const priorityOptions = ["Low", "Medium", "High"];
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const daysOfMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    if (task.recurrencePattern === "custom" && task.customCron.trim() !== "") {
      fetchCronDescription(task.customCron.replace(/\s+/g, "_"));
    }
  }, [task.customCron]);

  const handleChange = (name, value) => {
    if (name === "recurrenceYearDays") {
      value = value.replace(" ", "");
    }
    console.log(name, value);
    setTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSelection = (name, value) => {
    setTask((prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter((v) => v !== value)
        : [...prev[name], value],
    }));
  };

  const isValidCommaSeparatedIntegers = (min = 1, max = 365) => {
    const trimmedInput = task.recurrenceYearDays.replace(/\s/g, "");
    const regex = /^\d+(,\d+)*$/;
    if (!regex.test(trimmedInput)) {
      return false;
    }
    const values = trimmedInput.split(",");
    return values.every((value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= min && num <= max;
    });
  };

  const fetchCronDescription = async (cronExpr) => {
    try {
      const response = await fetch(
        `/api/cronjob?cron=${encodeURIComponent(cronExpr)}`
      );
      const data = await response.json();
      setTask((prev) => ({
        ...prev,
        customCronDescription: data.description || "Invalid Cron Expression",
      }));
    } catch (error) {
      setTask((prev) => ({
        ...prev,
        customCronDescription: "Error fetching description",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (task.recurrencePattern === "custom" && !isValidCommaSeparatedIntegers()) {
      alert("Invalid input. Please enter comma-separated integers (e.g., 1,2,3).");
      return;
    }
    const { success, error } = await AddOrUpdateTasks(task);
    clearStates();
    onClose();
  };

  const handleCancel = () => {
    clearStates();
    onClose();
  };

  const clearStates = () => { 
    setTask(initialTaskState);
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const handleEscapeKeyDown = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
      onClick={handleOutsideClick}
      onKeyDown={handleEscapeKeyDown}
    >
      <div className="max-w-lg max-h-screen mx-auto p-6 bg-white shadow-md rounded-lg overflow-y-auto transition-all duration-300 ease-in-out">
        <h2 className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">Creating Block <Blocks /></h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Task Title"
            value={task.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <label className="block mb-2">Start Time</label>
              <input
                type="time"
                name="start"
                value={task.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2">Total Time</label>
              <select
                name="totalTime"
                value={task.duration}
                onChange={(e) => handleChange("duration", parseInt(e.target.value, 10))}
                className="mt-1 block w-full px-3 py-2.5 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <textarea
            name="description"
            placeholder="Description"
            value={task.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full p-2 border rounded"
          />

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={task.isRecurring}
              onChange={() => handleChange("isRecurring", !task.isRecurring)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">Recurring</span>
          </label>

          <div
            className={`transition-all duration-300 ease-in-out ${
              task.isRecurring ? "max-h-[1000px]" : "max-h-0"
            } overflow-hidden`}
          >
            {task.isRecurring && (
              <div>
                <div>
                  <label className="block mb-2">Start:</label>
                  <input
                    type="date"
                    name="startDate"
                    value={task.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2">End:</label>
                  <input
                    type="date"
                    name="endDate"
                    value={task.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2">Recurrence Pattern:</label>
                  <div className="flex gap-2 flex-wrap">
                    {recurrenceOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          handleChange("recurrencePattern", option.toLowerCase())
                        }
                        className={`px-4 py-2 border rounded ${
                          task.recurrencePattern === option.toLowerCase()
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {task.recurrencePattern === "daily" && (
                  <div>
                    <label className="block mb-2">Repeat every:</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={task.recurrenceInterval}
                      onChange={(e) =>
                        handleChange("recurrenceInterval", parseInt(e.target.value, 10))
                      }
                      className="w-full p-2 border rounded"
                    />
                    <span className="text-gray-600">days</span>
                  </div>
                )}

                {task.recurrencePattern === "weekly" && (
                  <div>
                    <label className="block mb-2">Select Days:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleSelection("recurrenceDays", day)}
                          className={`p-2 border rounded ${
                            task.recurrenceDays.includes(day)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {task.recurrencePattern === "monthly" && (
                  <div>
                    <label className="block mb-2">Select Days of the Month:</label>
                    <div className="grid grid-cols-6 gap-2">
                      {daysOfMonth.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleSelection("recurrenceMonthDays", day)}
                          className={`p-2 border rounded ${
                            task.recurrenceMonthDays.includes(day)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {task.recurrencePattern === "yearly" && (
              <input
                type="text"
                name="recurrenceYearDays"
                placeholder="Enter day numbers (1-365, comma-separated)"
                value={task.recurrenceYearDays}
                onChange={e => handleChange("recurrenceYearDays", e.target.value)}
                className="w-full p-2 border rounded"
              />
            )}
                {task.recurrencePattern === "custom" && (<div>Under development</div>)}
                {/* {task.recurrencePattern === "custom" && (
                  <div>
                    <label className="block mb-2">Custom Cron:</label>
                    <input
                      type="text"
                      name="customCron"
                      value={task.customCron}
                      onChange={(e) => handleChange("customCron", e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <p className="text-sm text-gray-500 mt-2">{task.customCronDescription}</p>
                  </div>
                )} */}
              </div>
            )}
          </div>

          <div>
          <label className="block mb-2">Priority:</label>
          <div className="flex gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleChange("priority", option.toLowerCase())}
                className={`px-4 py-2 border rounded ${
                  task.priority === option.toLowerCase()
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Save Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
