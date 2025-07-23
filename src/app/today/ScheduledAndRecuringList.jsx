"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react"; // Loader2 for loading animation
import api from "@/axios";
import { MdEdit } from "react-icons/md";
import TaskInput from "./TaskInput";
import { Trash } from "lucide-react";

function ScheduledAndRecuringList({ isOpen, onClose }) {
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(false);
  const [editingTaskDetails, setEditingTaskDetails] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    api
      .get(`/getRecurringTasks`)
      .then((result) => {
        console.log(result);
        setRecurringTasks(result.data.data);
      })
      .catch((err) => {})
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  const handleDeleteRecurringTask = async (taskId) => {
    // setIsProcessing(true);
    try {
      await api.delete(`deleteRecurringTask/${taskId}`);
      setRecurringTasks(recurringTasks.filter((tsk) => tsk.id !== taskId));

    } catch (error) {
      console.error(error);
    } finally {
      // setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96 max-h-[80vh] overflow-y-auto z-50 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recurring Tasks</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
          </div>
        ) : recurringTasks.length === 0 ? (
          <p className="text-gray-500 text-center">No recurring tasks found.</p>
        ) : (
          <ul className="space-y-4">
            {recurringTasks.map((task) => (
              <li
                key={task.id}
                className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.recurrencePattern} | {task.startTime} |{" "}
                    {task.priority}
                  </p>
                </div>
                <div className="flex space-x-2 items-center">
                  <MdEdit
                    className="text-blue-300 text-center hover:text-blue-700 hover:cursor-pointer"
                    onClick={() => {
                      setEditingTask(true);
                      setEditingTaskDetails(task);
                    }}
                  />
                  <Trash className="text-red-500 hover:text-white hover:bg-red-700 hover:rounded-sm hover:cursor-pointer p-1  text-sm"
                  onClick={() => handleDeleteRecurringTask(task.id)}/>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* For Editing Task */}
      <TaskInput
        isOpen={editingTask}
        taskToEdit={editingTaskDetails}
        onClose={() => {
          setEditingTask(false);
          setEditingTaskDetails(null);
        }}
      />
    </div>
  );
}

export default ScheduledAndRecuringList;
